import { Channel, invoke } from "@tauri-apps/api/core";

interface PlaybackEvent {
  id: string;
  status: "loading" | "playing" | "paused" | "ended" | "error" | "stopped";
  position: number;
  seekRevision: number;
  duration: number;
  paused: boolean;
  error?: string;
}

type PlaybackControl =
  | { action: "pause" | "resume" | "stop" }
  | { action: "volume"; value: number }
  | { action: "seek"; value: { position: number; revision: number } };

export const usePlaybackStore = defineStore("opfelmusig:playback-store", () => {
  const toast = useToast();
  const auth = useAuth();
  const queueStore = useQueueStore();
  const volumeStore = useVolumeStore();
  const log = logger.withTag("player");
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
  let activeId: string | undefined;
  let nativeId: string | undefined;
  let seekRevision = 0;
  let started = false;
  let seekLoadingTimer: ReturnType<typeof setTimeout> | undefined;

  function clearSeekLoading() {
    clearTimeout(seekLoadingTimer);
    seekLoadingTimer = undefined;
  }

  function failed(id: string, cause: unknown) {
    if (activeId !== id) return;
    clearSeekLoading();
    pending.value = false;
    isPlaying.value = false;
    clock.reset(position.value);
    log.error("Native playback failed", { cause });
    toast.add({ title: "Unable to play", description: String(cause), color: "error" });
  }

  async function control(command: PlaybackControl, id = activeId) {
    if (!id) return;
    try {
      await invoke("native_playback_control", { id, command });
    } catch (cause) {
      if (command.action === "stop") log.error("Could not stop native playback", { cause });
      else failed(id, cause);
    }
  }

  function stop() {
    clearSeekLoading();
    if (nativeId) void control({ action: "stop" }, nativeId);
    nativeId = undefined;
    activeId = undefined;
    seekRevision = 0;
    started = false;
    pending.value = false;
    isPlaying.value = false;
    paused.value = true;
    clock.reset();
    duration.value = 0;
  }

  async function load(initiallyPaused = false) {
    const current = queueStore.current;
    if (!current) return stop();
    const resumeAt =
      initiallyPaused && savedPosition.value.id === current.id ? savedPosition.value.position : 0;
    clearSeekLoading();
    const resource = current.entry.resource;
    const id = crypto.randomUUID();
    activeId = id;
    seekRevision = 0;
    started = false;
    pending.value = true;
    isPlaying.value = false;
    paused.value = initiallyPaused;
    clock.reset();
    duration.value = resource.attributes.durationInMillis / 1000;
    savedPosition.value = { id: current.id, position: 0 };
    if (resumeAt > 0) seek(resumeAt);

    const events = new Channel<PlaybackEvent>();
    events.onmessage = (event) => {
      if (event.id !== activeId) return;
      if (event.status === "error") {
        failed(id, event.error ?? "Native playback failed");
        stop();
        return;
      }
      if (event.seekRevision < seekRevision) return;
      if (event.status !== "loading") clearSeekLoading();
      pending.value = event.status === "loading" && (event.seekRevision === 0 || pending.value);
      isPlaying.value = event.status === "playing";
      paused.value = event.paused;
      duration.value = event.duration;
      clock.sync(event.position, isPlaying.value && !paused.value);
      if (
        event.status !== "playing" ||
        Math.abs(event.position - savedPosition.value.position) >= 1
      ) {
        savedPosition.value.position = event.position;
      }
      if (event.status === "ended") {
        stop();
        queueStore.next();
        if (queueStore.current?.id === current.id) load();
      }
    };

    try {
      const credentials = await auth.getPlaybackCredentials();
      if (activeId !== id) return;
      nativeId = id;
      await invoke("native_playback_play", {
        request: {
          id,
          catalogId: resource.type === "songs" ? resource.id : resource.extras.catalogId,
          libraryId: resource.type === "library-songs" ? resource.id : resource.extras.libraryId,
          ...credentials,
          duration: duration.value,
          volume: volumeStore.output,
          paused: paused.value,
        },
        events,
      });
      if (activeId !== id) return void control({ action: "stop" }, id);
      started = true;
      if (seekRevision > 0) {
        void control({
          action: "seek",
          value: { position: position.value, revision: seekRevision },
        });
      }
    } catch (cause) {
      failed(id, cause);
      if (activeId === id) stop();
    }
  }

  function toggle() {
    if (!activeId) return void load();
    paused.value = !paused.value;
    if (paused.value) clock.reset(position.value);
    void control({ action: paused.value ? "pause" : "resume" });
  }

  function seek(seconds: number) {
    if (!Number.isFinite(seconds) || !activeId) return;
    const target = Math.max(0, Math.min(seconds, duration.value));
    clock.reset(target);
    savedPosition.value.position = target;
    isPlaying.value = false;
    const value = { position: target, revision: ++seekRevision };
    clearSeekLoading();
    if (!pending.value) {
      const id = activeId;
      seekLoadingTimer = setTimeout(() => {
        if (activeId === id && seekRevision === value.revision) pending.value = true;
      }, 150);
    }
    if (started) void control({ action: "seek", value });
  }

  function previous() {
    if (position.value > 5 || (queueStore.index === 0 && !queueStore.isLooping)) seek(0);
    else queueStore.previous();
  }

  let restoring = true;
  watch(
    () => queueStore.current?.id,
    () => {
      void load(restoring);
      restoring = false;
    },
    { immediate: true },
  );
  watchThrottled(
    () => volumeStore.output,
    (value) => void control({ action: "volume", value }),
    { throttle: 80 },
  );
  useNuxtApp().hook("auth:logout", stop);
  onScopeDispose(stop);

  return { pending, isPlaying, paused, position, duration, toggle, seek, previous };
});
