export default defineNuxtPlugin({
  name: "player:bridge",
  dependsOn: ["session:ready"],
  setup: () => {
    if (isMiniplayer) return {};

    return {
      provide: {
        miniplayerBridge: createWindowBridge("miniplayer", createMainHandlers()),
      },
    };
  },
});
