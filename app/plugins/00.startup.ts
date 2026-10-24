export default defineNuxtPlugin({
  name: "startup",
  enforce: "pre",
  setup: () => {
    logger.withTag("app").info("App started", { now: new Date() });
    const startedAt = performance.now();

    return {
      provide: { startedAt },
    };
  },
});
