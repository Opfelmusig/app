export default defineNuxtPlugin({
  name: "libcore:sync",
  dependsOn: ["libcore:prepare", "client:ready"],
  setup: async (nuxtApp) => {
    const db = useLibraryDb();
    const { refresh } = useLibrarySync();
    const { valid } = useAuth();

    async function initialize() {
      if (!valid.value) return;

      const state = await db.library_state.get("library");

      if (!state || state.state === "pending" || !state.lastSyncedAt) {
        await refresh();
      }
    }

    nuxtApp.hook("app:mounted", () => {
      const stop = watch(
        valid,
        (isValid) => {
          if (!isValid) return;

          initialize().catch((error) => {
            console.error("Initial library sync failed:", error);
          });
        },
        { immediate: true },
      );

      nuxtApp.vueApp.onUnmount(stop);
    });
  },
});
