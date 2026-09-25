<template>
  <SettingsWrapper>
    <SettingsSection>
      <SettingsToggle
        v-model="settingsStore.system.automaticUpdateChecks"
        label="Automatic update checks"
        description="Check for updates when Öpfelmusig starts and in intervals."
        :disabled="isDev"
      />
    </SettingsSection>
    <USeparator />
    <SettingsSection>
      <SettingsConfig label="Öpfelmusig">
        <span class="text-muted">v{{ appVersion }}</span>
      </SettingsConfig>
      <SettingsConfig label="Tauri">
        <span class="text-muted">v{{ tauriVersion }}</span>
      </SettingsConfig>
      <SettingsConfig label="Nuxt">
        <span class="text-muted">v{{ versions.nuxt }}</span>
      </SettingsConfig>
      <SettingsConfig label="Vue">
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

onMounted(async () => {
  appVersion.value = await getVersion();
  tauriVersion.value = await getTauriVersion();
});
</script>
