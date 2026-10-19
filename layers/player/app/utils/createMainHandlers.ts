export default function createMainHandlers(): MainFunctions {
  const playbackStore = usePlaybackStore();
  const settingsStore = useSettingsStore();
  const queueStore = useQueueStore();

  return {
    next: playbackStore.next,
    previous: playbackStore.previous,
    toggle: playbackStore.toggle,
    seek: playbackStore.seek,
    sync(): MiniplayerSync {
      return {
        layout: settingsStore.player.miniplayerLayout,
        playback: {
          track: queueStore.current?.entry ?? null,
          loading: playbackStore.loading,
          paused: playbackStore.paused,
          position: playbackStore.position,
        },
      };
    },
  };
}
