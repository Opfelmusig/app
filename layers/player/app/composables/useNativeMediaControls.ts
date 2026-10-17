import { Channel, invoke } from "@tauri-apps/api/core";

type MediaEvent =
  | { event: "play" | "pause" | "toggle" | "next" | "previous" | "stop" }
  | { event: "seekBy"; data: { seconds: number } }
  | { event: "setPosition"; data: { position: number } }
  | { event: "setVolume"; data: { volume: number } }
  | { event: "setShuffle"; data: { enabled: boolean } }
  | { event: "setRepeat"; data: { mode: "off" | "one" | "all" } };

interface MediaPlayback {
  play(): void;
  pause(): void;
  toggle(): void;
  next(): void;
  previous(): void;
  stop(): void;
  seek(seconds: number): void;
  position: Ref<number>;
}

export function useNativeMediaControls(playback: MediaPlayback) {
  const queueStore = useQueueStore();
  const volumeStore = useVolumeStore();
  const log = logger.withTag("media-controls");

  function syncModes() {
    return invoke("native_media_set_play_modes", {
      shuffle: !queueStore.isStation && queueStore.isShuffling,
      repeat: !queueStore.isStation && queueStore.isLooping,
    }).catch((cause) => log.warn("Could not update system playback modes", { cause }));
  }

  const events = new Channel<MediaEvent>((event) => {
    if (!("data" in event)) return playback[event.event]();
    switch (event.event) {
      case "seekBy":
        return playback.seek(playback.position.value + event.data.seconds);
      case "setPosition":
        return playback.seek(event.data.position);
      case "setVolume":
        volumeStore.volume = event.data.volume;
        return;
      case "setShuffle":
        if (queueStore.isStation || queueStore.isShuffling === event.data.enabled)
          return syncModes();
        queueStore.toggleShuffle();
        return;
      case "setRepeat":
        if (queueStore.isStation || event.data.mode === "one") return syncModes();
        if (queueStore.isLooping === (event.data.mode === "all")) return syncModes();
        queueStore.isLooping = event.data.mode === "all";
    }
  });
  invoke("native_media_listen", { events }).catch((cause) =>
    log.warn("Could not register system media controls", { cause }),
  );
  watch(
    [() => queueStore.isStation, () => queueStore.isShuffling, () => queueStore.isLooping],
    syncModes,
    { immediate: true },
  );
}
