import { invoke } from "@tauri-apps/api/core";

export default defineNuxtPlugin({
  name: "settings:tray",
  dependsOn: ["pinia", "pinia-plugin-persistedstate"],
  setup() {
    if (isMiniplayer) return;

    const settingsStore = useSettingsStore();
    const log = logger.withTag("tray");

    watch(
      () => settingsStore.system.minimizeToTray,
      (enabled) => {
        invoke("native_set_minimize_to_tray", { enabled }).catch((cause) =>
          log.error("Could not synchronize minimize to tray", { cause }),
        );
      },
      { immediate: true },
    );
  },
});
