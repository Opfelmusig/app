export default defineNuxtPlugin({
  name: "miniplayer:ready",
  setup: () => {
    if (isMiniplayer) return;

    useMiniplayer().refresh();
  },
});
