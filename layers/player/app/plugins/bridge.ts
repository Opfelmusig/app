export default defineNuxtPlugin({
  name: "player:bridge",
  dependsOn: ["session:ready"],
  setup: () => {
    if (isMiniplayer) return {};

    const log = logger.withTag("miniplayer");

    const playbackStore = usePlaybackStore();
    const settingsStore = useSettingsStore();
    const queueStore = useQueueStore();
    const { isOpen } = useMiniplayer();

    const bridge = createWindowBridge("miniplayer", createMainHandlers());

    watch(
      () => settingsStore.player.miniplayerLayout,
      (layout) => {
        if (!isOpen.value) return;
        bridge
          .setLayout(layout)
          .catch((cause) => log.error("Could not update miniplayer layout", { cause }));
      },
    );

    watch(
      [
        () => queueStore.current?.id,
        () => queueStore.current?.entry.resource,
        () => playbackStore.paused,
        () => playbackStore.loading,
      ],
      () => {
        if (!isOpen.value) return;
        bridge
          .setPlayback({
            track: queueStore.current?.entry.resource ?? null,
            loading: playbackStore.loading,
            paused: playbackStore.paused,
            position: playbackStore.position,
          })
          .catch((cause) => log.error("Could not update miniplayer playback", { cause }));
      },
    );

    watchThrottled(
      () => playbackStore.position,
      () => {
        if (!isOpen.value) return;
        bridge.updatePosition
          .asEvent(playbackStore.position)
          .catch((cause) => log.error("Could not update miniplayer position", { cause }));
      },
      { throttle: 250 },
    );
  },
});
