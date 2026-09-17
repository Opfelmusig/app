import { isCacheReady } from "@pinia/colada-plugin-cache-persister";

export default defineNuxtPlugin({
  name: "colada-ready",
  dependsOn: ["Pinia Colada"],
  async setup() {
    await isCacheReady();
  },
});
