export default defineNuxtPlugin({
  name: "miniplayer:bridge",
  setup: async () => {
    if (!isMiniplayer) return {};

    const bridge = createWindowBridge("main", createMiniplayerHandlers());

    const miniplayerStore = useMiniplayerStore();

    const sync = await bridge.sync();
    miniplayerStore.setLayout(sync.layout);
    miniplayerStore.setPlayback(sync.playback);

    return {
      provide: {
        mainBridge: bridge,
      },
    };
  },
});
