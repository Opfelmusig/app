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
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
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
</script>
