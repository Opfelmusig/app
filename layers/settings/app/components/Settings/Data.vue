<template>
  <SettingsWrapper>
    <SettingsSection>
      <SettingsConfig
        no-label
        label="Cached Apple Music data"
        description="Refresh cached responses from Apple Music."
        :error="cacheError"
      >
        <UButton
          color="warning"
          variant="soft"
          icon="lucide:refresh-cw"
          label="Refresh cache"
          :loading="invalidatingCache"
          @click="invalidateCache"
        />
      </SettingsConfig>
      <SettingsConfig no-label label="App data folder">
        <UButton
          color="neutral"
          variant="soft"
          icon="lucide:folder-open"
          label="Open folder"
          :loading="openingDataDirectory"
          @click="openDataDirectory"
        />
      </SettingsConfig>
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

const openingDataDirectory = ref(false);
const queryCache = useQueryCache();
const invalidatingCache = ref(false);
const cacheError = ref<Error | null>(null);

async function invalidateCache() {
  if (invalidatingCache.value) return;

  invalidatingCache.value = true;
  cacheError.value = null;

  try {
    queryCache.cancelQueries({ active: false });
    for (const entry of queryCache.getEntries({ active: false })) queryCache.remove(entry);
    await queryCache.invalidateQueries({ active: true });
  } catch (cause) {
    logger.withTag("cache").error("Failed to invalidate cached data", { cause });
    cacheError.value = new Error("Could not invalidate the cache. Please try again.");
  } finally {
    invalidatingCache.value = false;
  }
}

async function openDataDirectory() {
  openingDataDirectory.value = true;
  try {
    await openPath(await appDataDir());
  } finally {
    openingDataDirectory.value = false;
  }
}
</script>
