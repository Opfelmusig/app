export default defineNuxtPlugin({
  name: "miniplayer:ready",
  setup: () => {
    useMiniplayer().refresh();
  },
});
