import { Channel, invoke } from "@tauri-apps/api/core";
import { clamp } from "remeda";

import { createPlaybackActivityReporter } from "#layers/player/app/lib/activity";
import type { QueueEntry } from "#layers/player/app/types/queue";

interface PlaybackEvent {
  id: string;
  status: "loading" | "playing" | "paused" | "ended" | "error" | "stopped";
  position: number;
  seekRevision: number;
  duration: number;
  paused: boolean;
  reporting?: boolean;
  error?: string;
}

type PlaybackControl =
  | { action: "pause" | "resume" | "stop" }
  | { action: "volume"; value: number }
  | {
      action: "audio";
      value: { normalization: boolean; equalizer: { enabled: boolean; gains: number[] } };
    }
  | { action: "seek"; value: { position: number; revision: number } };

interface PlaybackSession {
  id: string;
  entry: QueueEntry;
  seekRevision: number;
  ready: boolean;
  recorded: boolean;
}

export const usePlaybackStore = defineStore("opfelmusig:playback-store", () => {
  const toast = useToast();
  const auth = useAuth();
  const client = useClient();
  const queueStore = useQueueStore();
  const historyStore = useHistoryStore();
  const volumeStore = useVolumeStore();
  const settingsStore = useSettingsStore();
  const log = logger.withTag("player");
  const activity = createPlaybackActivityReporter({
    send: async (event, signal) => {
      if (settingsStore.player.activityReporting) {
        await client.playback.reportPlayActivity(event, { config: { signal } });
      }
    },
    getStorefront: () => (auth.valid.value ? auth.storefront.value?.id : undefined),
    getPlayMode: () => ({
      repeat: !queueStore.isStation && queueStore.isLooping,
      shuffle: !queueStore.isStation && queueStore.isShuffling,
    }),
    onError: (cause) => log.warn("Could not report Apple Music playback activity", { cause }),
  });
  const savedPosition = useLocalStorage(
    "opfelmusig:playback:position",
    { id: "", position: 0 },
    { writeDefaults: false, flush: "sync" },
  );

  const status = ref<PlaybackEvent["status"]>("stopped");
  const paused = ref(true);
  const {
    isPending: delayingSeekSpinner,
    start: delaySeekSpinner,
    stop: clearSeekSpinnerDelay,
  } = useTimeoutFn(() => undefined, 150, { immediate: false });
  const loading = computed(() => status.value === "loading" && !delayingSeekSpinner.value);
  const playing = computed(() => status.value === "playing" && !paused.value);
  const duration = ref(0);
  const clock = usePlaybackClock(duration);
  const { position } = clock;
  let session: PlaybackSession | undefined;

  function stop(reason: Parameters<typeof activity.end>[0] = "stop") {
    clearSeekSpinnerDelay();
    activity.end(reason, position.value, duration.value);
    const id = session?.id;
    session = undefined;
    status.value = "stopped";
    paused.value = true;
    clock.reset();
    duration.value = 0;
    if (id) control({ action: "stop" }, id);
  }

  function fail(id: string, cause: unknown) {
    if (session?.id !== id) return;
    const song = session.entry.entry;
    log.error("Native playback failed", {
      cause,
      sessionId: id,
      song: { id: song.id, type: song.type, name: song.attributes.name },
      position: position.value,
      duration: duration.value,
    });
    stop("error");
    toast.add({ title: "Unable to play", description: String(cause), color: "error" });
  }

  async function control(command: PlaybackControl, id = session?.id) {
    if (!id) return;
    try {
      await invoke("native_playback_control", { id, command });
    } catch (cause) {
      if (command.action === "stop") log.error("Could not stop native playback", { cause });
      else fail(id, cause);
    }
  }

  function handlePlaybackEvent(event: PlaybackEvent) {
    const current = session;
    if (!current || event.id !== current.id) return;
    if (event.status === "error") {
      clock.reset(event.position);
      duration.value = event.duration;
      return fail(current.id, event.error ?? "Native playback failed");
    }
    if (event.seekRevision < current.seekRevision) return;

    if (event.status !== "loading") clearSeekSpinnerDelay();
    status.value = event.status;
    paused.value = event.paused;
    duration.value = event.duration;
    clock.sync(event.position, playing.value);

    if (event.status === "ended" || event.status === "stopped") {
      activity.end(event.status === "ended" ? "ended" : "stop", event.position, event.duration);
    } else if (event.paused) {
      activity.end("pause", event.position, event.duration);
    } else if (playing.value && settingsStore.player.activityReporting) {
      activity.start(event.position, event.duration, event.reporting);
    }
    if (playing.value && !current.recorded) {
      current.recorded = true;
      historyStore.record(current.entry.entry);
    }
    if (
      event.status !== "playing" ||
      Math.abs(event.position - savedPosition.value.position) >= 1
    ) {
      savedPosition.value.position = event.position;
    }
    if (event.status === "ended") {
      queueStore.next();
      if (!queueStore.current) stop();
      else if (queueStore.current.id === current.entry.id && !queueStore.isStation) load();
    }
  }

  async function load(restore = false) {
    const entry = queueStore.current;
    const resumeAt =
      restore && savedPosition.value.id === entry?.id ? savedPosition.value.position : 0;
    stop(entry ? "select" : "stop");
    if (!entry) return;

    const resource = entry.entry;
    const current: PlaybackSession = {
      id: crypto.randomUUID(),
      entry,
      seekRevision: 0,
      ready: false,
      recorded: false,
    };
    session = current;
    status.value = "loading";
    paused.value = restore;
    duration.value = resource.attributes.durationInMillis / 1000;
    savedPosition.value = { id: entry.id, position: 0 };
    activity.setItem(resource, entry.fromContext ? queueStore.context : null);
    if (resumeAt > 0) seek(resumeAt);

    try {
      const credentials = await auth.getPlaybackCredentials();
      if (session !== current) return;
      await invoke("native_playback_play", {
        request: {
          id: current.id,
          song: resource,
          ...credentials,
          volume: volumeStore.output,
          paused: paused.value,
          audio: settingsStore.playback,
        },
        events: new Channel<PlaybackEvent>(handlePlaybackEvent),
      });
      if (session !== current) return control({ action: "stop" }, current.id);
      current.ready = true;
      if (current.seekRevision > 0) {
        control({
          action: "seek",
          value: { position: position.value, revision: current.seekRevision },
        });
      }
    } catch (cause) {
      fail(current.id, cause);
    }
  }

  function play() {
    if (!queueStore.current) return;
    if (!session) return load();
    if (!paused.value) return;
    paused.value = false;
    control({ action: "resume" });
  }

  function pause() {
    if (!session || paused.value) return;
    paused.value = true;
    clock.reset(position.value);
    control({ action: "pause" });
  }

  function toggle() {
    return paused.value ? play() : pause();
  }

  function seek(seconds: number) {
    if (!Number.isFinite(seconds) || !session) return;
    const target = clamp(seconds, { min: 0, max: duration.value });
    activity.seek(position.value, target, duration.value);
    clock.reset(target);
    savedPosition.value.position = target;
    if (!loading.value) delaySeekSpinner();
    status.value = "loading";
    const revision = ++session.seekRevision;
    if (session.ready) control({ action: "seek", value: { position: target, revision } });
  }

  function skip(direction: "next" | "previous") {
    if (direction === "previous" && position.value > 5) return seek(0);
    const id = queueStore.current?.id;
    queueStore[direction]();
    if (!id) return;
    if (queueStore.current?.id !== id) activity.end(direction, position.value, duration.value);
    else if (!queueStore.isStation) seek(0);
  }

  const next = () => skip("next");
  const previous = () => skip("previous");
  useNativeMediaControls({ play, pause, toggle, next, previous, stop, seek, position });
  useDiscordPresence({ playing, position, duration });

  let restoring = true;
  watch(
    () => queueStore.current?.id,
    () => {
      load(restoring);
      restoring = false;
    },
    { immediate: true },
  );
  watchThrottled(
    () => volumeStore.output,
    (value) => control({ action: "volume", value }),
    { throttle: 80 },
  );
  watchThrottled(
    () => settingsStore.playback,
    (value) => control({ action: "audio", value }),
    { deep: true, throttle: 80 },
  );
  watch(
    auth.valid,
    (valid) => {
      if (valid) return;

      stop();
      queueStore.clear();
      historyStore.clear();
      savedPosition.value = { id: "", position: 0 };
    },
    { flush: "sync" },
  );
  watch(
    [auth.valid, () => settingsStore.player.activityReporting],
    ([valid]) => {
      activity.reset();
      if (valid && session) {
        activity.setItem(
          session.entry.entry,
          session.entry.fromContext ? queueStore.context : null,
        );
      }
    },
    { flush: "sync" },
  );

  return {
    loading,
    playing,
    paused,
    position,
    duration,
    play,
    pause,
    toggle,
    seek,
    next,
    previous,
  };
});
