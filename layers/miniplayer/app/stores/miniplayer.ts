import { LogicalSize } from "@tauri-apps/api/window";

export const useMiniplayerStore = defineStore("opfelmusig:miniplayer-store", () => {
  const log = logger.withTag("miniplayer");

  const layout = ref<MiniplayerLayout>("default");
  const track = ref<AmSong | null>(null);
  const paused = ref(true);
  const loading = ref(false);

  const duration = computed(() => (track.value?.attributes.durationInMillis ?? 0) / 1000);

  const clock = usePlaybackClock(duration);
  const { position } = clock;

  function updatePosition(seconds: number) {
    clock.sync(seconds, !paused.value && !loading.value);
  }

  async function setLayout(newLayout: MiniplayerLayout) {
    const { width, height } = miniplayerLayoutConfiguration[newLayout];
    try {
      await currentWindow.setSize(new LogicalSize(width, height));
      layout.value = newLayout;
    } catch (cause) {
      log.error("Failed to resize miniplayer", { cause });
    }
  }

  function setPlayback(playback: MiniplayerPlayback) {
    track.value = playback.track;
    loading.value = playback.loading;
    paused.value = playback.paused;
    updatePosition(playback.position);
  }

  return { layout, track, position, paused, loading, updatePosition, setLayout, setPlayback };
});
