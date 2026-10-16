export default defineNuxtPlugin({
  name: "settings:updater",
  dependsOn: ["pinia", "pinia-plugin-persistedstate"],
  setup() {
    if (isDev) return;

    const settingsStore = useSettingsStore();
    const updater = useUpdaterStore();
    const toast = useToast();
    let snoozed = false;

    async function checkForUpdates() {
      const version = await updater.checkForUpdate(true);
      if (
        !settingsStore.system.automaticUpdateChecks ||
        updater.status !== "available" ||
        !version ||
        snoozed
      )
        return;

      toast.add({
        id: "update-available",
        title: "Update available",
        description: `Öpfelmusig v${version} is available.`,
        duration: 0,
        actions: [
          { label: "Update", icon: "lucide:download", onClick: () => updater.update() },
          {
            label: "Changelog",
            icon: "lucide:external-link",
            onClick: () => updater.openChangelog(),
            color: "neutral",
            variant: "soft",
          },
          {
            label: "Snooze until restart",
            icon: "lucide:timer",
            onClick: () => (snoozed = true),
            color: "neutral",
            variant: "soft",
          },
        ],
      });
    }

    const { pause, resume } = useIntervalFn(checkForUpdates, ms("6h"), { immediate: false });
    watch(
      () => settingsStore.system.automaticUpdateChecks,
      (enabled) => {
        if (enabled) {
          checkForUpdates();
          resume();
        } else {
          pause();
        }
      },
      { immediate: true },
    );
  },
});
