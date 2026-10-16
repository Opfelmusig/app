import { Channel, invoke } from "@tauri-apps/api/core";

import { createPlaybackActivityReporter } from "#layers/player/app/lib/activity";
import type { QueueEntry } from "#layers/player/app/types/queue";

type MediaEvent =
  | { event: "play" | "pause" | "toggle" | "next" | "previous" | "stop" }
  | { event: "seekBy"; data: { seconds: number } }
  | { event: "setPosition"; data: { position: number } }
  | { event: "setVolume"; data: { volume: number } };

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
  queueEntry: QueueEntry;
  seekRevision: number;
  started: boolean;
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

  const pending = ref(false);
  const isPlaying = ref(false);
  const paused = ref(true);
  const duration = ref(0);
  const clock = usePlaybackClock(duration);
  const { position } = clock;
  let session: PlaybackSession | undefined;
  let nativeId: string | undefined;
  let seekLoadingTimer: ReturnType<typeof setTimeout> | undefined;

  function clearSeekLoading() {
    clearTimeout(seekLoadingTimer);
    seekLoadingTimer = undefined;
  }

  function failed(id: string, cause: unknown) {
    if (session?.id !== id) return;
    activity.end("error", position.value, duration.value);
    clearSeekLoading();
    pending.value = false;
    isPlaying.value = false;
    clock.reset(position.value);
    log.error("Native playback failed", { cause });
    toast.add({ title: "Unable to play", description: String(cause), color: "error" });
  }

  async function control(command: PlaybackControl, id = session?.id) {
    if (!id) return;
    try {
      await invoke("native_playback_control", { id, command });
    } catch (cause) {
      if (command.action === "stop") log.error("Could not stop native playback", { cause });
      else failed(id, cause);
    }
  }

  function stop() {
    activity.end("stop", position.value, duration.value);
    clearSeekLoading();
    if (nativeId) control({ action: "stop" }, nativeId);
    nativeId = undefined;
    session = undefined;
    pending.value = false;
    isPlaying.value = false;
    paused.value = true;
    clock.reset();
    duration.value = 0;
  }

  function handlePlaybackEvent(event: PlaybackEvent) {
    const playback = session;
    if (!playback || event.id !== playback.id) return;
    if (event.status === "error") {
      activity.end("error", event.position, event.duration);
      failed(playback.id, event.error ?? "Native playback failed");
      stop();
      return;
    }
    if (event.seekRevision < playback.seekRevision) return;

    if (event.status === "ended") activity.end("ended", event.position, event.duration);
    else if (event.status === "stopped") activity.end("stop", event.position, event.duration);
    else if (event.paused) activity.end("pause", event.position, event.duration);
    else if (event.status === "playing" && settingsStore.player.activityReporting) {
      activity.start(event.position, event.duration, event.reporting);
    }

    if (event.status !== "loading") clearSeekLoading();
    pending.value = event.status === "loading" && (seekLoadingTimer === undefined || pending.value);
    isPlaying.value = event.status === "playing";
    paused.value = event.paused;
    duration.value = event.duration;
    clock.sync(event.position, isPlaying.value && !paused.value);

    if (!playback.recorded && isPlaying.value && !paused.value) {
      playback.recorded = true;
      historyStore.record(playback.queueEntry.entry);
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
      else if (queueStore.current.id === playback.queueEntry.id && !queueStore.isStation) load();
    }
  }

  async function load(initiallyPaused = false) {
    const current = queueStore.current;
    if (!current) return stop();
    activity.end("select", position.value, duration.value);
    const resumeAt =
      initiallyPaused && savedPosition.value.id === current.id ? savedPosition.value.position : 0;
    clearSeekLoading();
    const resource = current.entry.resource;
    activity.setItem(resource, current.fromContext ? queueStore.context : null);
    const playback: PlaybackSession = {
      id: crypto.randomUUID(),
      queueEntry: current,
      seekRevision: 0,
      started: false,
      recorded: false,
    };
    session = playback;
    pending.value = true;
    isPlaying.value = false;
    paused.value = initiallyPaused;
    clock.reset();
    duration.value = resource.attributes.durationInMillis / 1000;
    savedPosition.value = { id: current.id, position: 0 };
    if (resumeAt > 0) seek(resumeAt);

    try {
      const credentials = await auth.getPlaybackCredentials();
      if (session !== playback) return;
      nativeId = playback.id;
      await invoke("native_playback_play", {
        request: {
          id: playback.id,
          song: resource,
          ...credentials,
          volume: volumeStore.output,
          paused: paused.value,
          audio: settingsStore.playback,
        },
        events: new Channel<PlaybackEvent>(handlePlaybackEvent),
      });
      if (session !== playback) return control({ action: "stop" }, playback.id);
      playback.started = true;
      if (playback.seekRevision > 0) {
        control({
          action: "seek",
          value: { position: position.value, revision: playback.seekRevision },
        });
      }
    } catch (cause) {
      failed(playback.id, cause);
      if (session === playback) stop();
    }
  }

  function play() {
    if (queueStore.current && paused.value) toggle();
  }

  function toggle() {
    if (!session) return load();
    paused.value = !paused.value;
    if (paused.value) clock.reset(position.value);
    control({ action: paused.value ? "pause" : "resume" });
  }

  function seek(seconds: number) {
    const playback = session;
    if (!Number.isFinite(seconds) || !playback) return;
    const target = Math.max(0, Math.min(seconds, duration.value));
    activity.seek(position.value, target, duration.value);
    clock.reset(target);
    savedPosition.value.position = target;
    isPlaying.value = false;
    const value = { position: target, revision: ++playback.seekRevision };
    clearSeekLoading();
    if (!pending.value) {
      seekLoadingTimer = setTimeout(() => {
        if (session === playback && playback.seekRevision === value.revision) pending.value = true;
      }, 150);
    }
    if (playback.started) control({ action: "seek", value });
  }

  function next() {
    const currentId = queueStore.current?.id;
    queueStore.next();
    if (currentId && queueStore.current?.id !== currentId) {
      activity.end("next", position.value, duration.value);
    }
    if (currentId && queueStore.current?.id === currentId && !queueStore.isStation) seek(0);
  }

  function previous() {
    if (position.value > 5) return seek(0);
    const currentId = queueStore.current?.id;
    queueStore.previous();
    if (currentId && queueStore.current?.id !== currentId) {
      activity.end("previous", position.value, duration.value);
    }
    if (currentId && queueStore.current?.id === currentId && !queueStore.isStation) seek(0);
  }

  const mediaEvents = new Channel<MediaEvent>((event) => {
    switch (event.event) {
      case "play":
        return play();
      case "pause":
        if (!paused.value) toggle();
        return;
      case "toggle":
        return toggle();
      case "next":
        return next();
      case "previous":
        return previous();
      case "stop":
        return stop();
      case "seekBy":
        return seek(position.value + event.data.seconds);
      case "setPosition":
        return seek(event.data.position);
      case "setVolume":
        volumeStore.volume = event.data.volume;
        break;
    }
  });
  invoke("native_media_listen", { events: mediaEvents }).catch((cause) =>
    log.warn("Could not register system media controls", { cause }),
  );

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
  useNuxtApp().hook("auth:logout", stop);
  watch(
    () => settingsStore.player.activityReporting,
    () => {
      activity.reset();
      if (session) {
        const { queueEntry } = session;
        activity.setItem(
          queueEntry.entry.resource,
          queueEntry.fromContext ? queueStore.context : null,
        );
      }
    },
    { flush: "sync" },
  );
  watch(
    auth.valid,
    (valid) => {
      if (!valid) activity.reset();
    },
    { flush: "sync" },
  );
  watchThrottled(
    () => settingsStore.playback,
    (value) => control({ action: "audio", value }),
    { deep: true, throttle: 80 },
  );
  useDiscordPresence({ isPlaying, paused, position, duration });

  return { pending, isPlaying, paused, position, duration, play, toggle, seek, next, previous };
});
