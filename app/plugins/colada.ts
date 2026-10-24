import { isCacheReady } from "@pinia/colada-plugin-cache-persister";

export default defineNuxtPlugin({
  name: "colada:ready",
  dependsOn: ["Pinia Colada"],
  async setup() {
    if (isMiniplayer) return;

    const startedAt = performance.now();

    await isCacheReady();

    logger.withTag("colada").info("Colada ready", {
      durationMs: Math.round(performance.now() - startedAt),
    });
  },
});
