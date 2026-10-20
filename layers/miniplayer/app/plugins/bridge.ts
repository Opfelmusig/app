export default defineNuxtPlugin({
  name: "miniplayer:bridge",
  setup: async () => {
    if (!isMiniplayer) return {};

    const log = logger.withTag("miniplayer");

    const bridge = createWindowBridge("main", createMiniplayerHandlers());

    const miniplayerStore = useMiniplayerStore();

    try {
      const sync = await bridge.sync();
      miniplayerStore.setLayout(sync.layout);
      miniplayerStore.setPlayback(sync.playback);
    } catch (cause) {
      log.error("Failed to sync with the main window", { cause });
    }

    return {
      provide: {
        mainBridge: bridge,
      },
    };
  },
});
