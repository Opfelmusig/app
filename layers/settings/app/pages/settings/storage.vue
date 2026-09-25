<template>
  <SettingsWrapper>
    <SettingsConfig no-label label="Data directory">
      <UButton
        color="neutral"
        variant="soft"
        icon="lucide:folder-open"
        label="Open directory"
        :loading="openingDataDirectory"
        @click="openDataDirectory"
      />
    </SettingsConfig>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

const openingDataDirectory = ref(false);

async function openDataDirectory() {
  openingDataDirectory.value = true;
  try {
    await openPath(await appDataDir());
  } finally {
    openingDataDirectory.value = false;
  }
}
</script>
