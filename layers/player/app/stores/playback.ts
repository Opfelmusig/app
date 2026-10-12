import { Channel, invoke } from "@tauri-apps/api/core";

interface PlaybackEvent {
  id: string;
  status: "loading" | "playing" | "paused" | "ended" | "error" | "stopped";
  position: number;
  duration: number;
  paused: boolean;
  error?: string;
}

type PlaybackControl =
  | { action: "pause" | "resume" | "stop" }
  | { action: "seek" | "volume"; value: number };

export const usePlaybackStore = defineStore("opfelmusig:playback-store", () => {
  const toast = useToast();
  const auth = useAuth();
  const queueStore = useQueueStore();
  const volumeStore = useVolumeStore();
  const log = logger.withTag("player");

  const pending = ref(false);
  const isPlaying = ref(false);
  const paused = ref(true);
  const position = ref(0);
  const duration = ref(0);
  let activeId: string | undefined;
  let nativeId: string | undefined;

  function stopNative(id: string | undefined) {
    if (!id) return;
    void invoke("native_playback_control", { id, command: { action: "stop" } }).catch((cause) =>
      log.error("Could not stop native playback", { cause }),
    );
  }

  function failed(id: string, cause: unknown) {
    if (activeId !== id) return;
    pending.value = false;
    isPlaying.value = false;
    log.error("Native playback failed", { cause });
    toast.add({ title: "Unable to play", description: String(cause), color: "error" });
  }

  async function control(command: PlaybackControl) {
    const id = activeId;
    if (!id) return;
    try {
      await invoke("native_playback_control", { id, command });
    } catch (cause) {
      failed(id, cause);
    }
  }

  function stop() {
    stopNative(nativeId);
    nativeId = undefined;
    activeId = undefined;
    pending.value = false;
    isPlaying.value = false;
    paused.value = true;
    position.value = 0;
    duration.value = 0;
  }

  async function load(initiallyPaused = false) {
    const current = queueStore.current;
    if (!current) return stop();
    const resource = current.entry.resource;
    const id = crypto.randomUUID();
    activeId = id;
    pending.value = true;
    isPlaying.value = false;
    paused.value = initiallyPaused;
    position.value = 0;
    duration.value = resource.attributes.durationInMillis / 1000;

    const events = new Channel<PlaybackEvent>();
    events.onmessage = (event) => {
      if (event.id !== activeId) return;
      pending.value = event.status === "loading";
      isPlaying.value = event.status === "playing";
      paused.value = event.paused;
      position.value = event.position;
      duration.value = event.duration;
      if (event.status === "error") {
        failed(id, event.error ?? "Native playback failed");
        stop();
      } else if (event.status === "ended") {
        stop();
        queueStore.next();
        // A one-track looping queue keeps the same entry, so its watcher does not run.
        if (queueStore.current?.id === current.id) void load();
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
      if (activeId !== id) stopNative(id);
    } catch (cause) {
      failed(id, cause);
      if (activeId === id) {
        stop();
      }
    }
  }

  function toggle() {
    if (!activeId) return void load();
    paused.value = !paused.value;
    void control({ action: paused.value ? "pause" : "resume" });
  }

  function seek(seconds: number) {
    if (!Number.isFinite(seconds)) return;
    void control({ action: "seek", value: Math.max(0, Math.min(seconds, duration.value)) });
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

  return { pending, isPlaying, paused, position, duration, toggle, seek };
});
