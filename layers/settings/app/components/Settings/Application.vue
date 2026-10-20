<template>
  <SettingsWrapper>
    <SettingsSection title="Window behavior">
      <SettingsToggle
        v-if="!isMacos"
        v-model="settingsStore.system.hideTitlebarControls"
        label="Hide title bar controls"
      />
      <SettingsToggle
        v-model="settingsStore.system.minimizeToTray"
        label="Keep running when the window closes"
        description="Minimize Öpfelmusig to the tray when closing the window."
      />
    </SettingsSection>
    <SettingsSection title="Updates">
      <SettingsConfig no-label label="Check for updates">
        <UpdaterButtons />
      </SettingsConfig>
      <SettingsToggle
        v-model="settingsStore.system.automaticUpdateChecks"
        label="Automatic update checks"
        description="Check for updates when Öpfelmusig starts and at regular intervals."
        :disabled="isDev"
      />
    </SettingsSection>
    <SettingsSection title="Technical information">
      <SettingsConfig no-label label="App version">
        <span class="text-muted">v{{ appVersion }}</span>
      </SettingsConfig>
      <SettingsConfig no-label label="Tauri">
        <span class="text-muted">v{{ tauriVersion }}</span>
      </SettingsConfig>
      <SettingsConfig no-label label="Nuxt">
        <span class="text-muted">v{{ versions.nuxt }}</span>
      </SettingsConfig>
      <SettingsConfig no-label label="Vue">
        <span class="text-muted">v{{ versions.vue }}</span>
      </SettingsConfig>
    </SettingsSection>
  </SettingsWrapper>
</template>

<script setup lang="ts">
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";

const settingsStore = useSettingsStore();

const { versions } = useNuxtApp();
const appVersion = ref<string>();
const tauriVersion = ref<string>();

Promise.all([getVersion(), getTauriVersion()])
  .then(([app, tauri]) => {
    appVersion.value = app;
    tauriVersion.value = tauri;
  })
  .catch((cause) => logger.withTag("settings").error("Could not load versions", { cause }));
</script>
