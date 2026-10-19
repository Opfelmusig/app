<template>
  <SettingsWrapper>
    <SettingsSection title="Library sync">
      <SettingsConfig
        no-label
        label="Sync with Apple Music"
        description="Refresh your local library. This can take a while."
        :error
      >
        <UButton
          color="warning"
          variant="soft"
          icon="lucide:folder-sync"
          label="Sync now"
          :disabled="state.initializing"
          :loading="state.syncing"
          @click="sync"
        />
      </SettingsConfig>
      <SettingsConfig no-label label="Last synced">
        <span class="text-muted">
          <UBadge variant="soft" :color="lastSyncedAtBadgeColor">
            <NuxtTime
              v-if="state.lastSyncedAt"
              :datetime="state.lastSyncedAt"
              relative
              numeric="auto"
              relative-style="narrow"
            />
            <span v-else>Not synced yet</span>
          </UBadge>
        </span>
      </SettingsConfig>
    </SettingsSection>
    <SettingsSection title="Library contents">
      <div class="flex flex-col gap-2">
        <SettingsConfig no-label label="Songs">
          <UBadge variant="soft" :color="badgeColor(progress.songs.done)">
            {{ progress.state === "idle" ? (stats?.songs ?? 0) : progress.songs.count }}
          </UBadge>
        </SettingsConfig>
      </div>
    </SettingsSection>
    <SettingsSection title="Local data">
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
import type { BadgeProps } from "@nuxt/ui";
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

const { sync, state, progress, error, client } = useLibrary();
const { data: stats } = useLibraryQuery({
  key: ["stats"],
  query: () => client.stats(),
});

const badgeColor = (done: boolean): BadgeProps["color"] =>
  progress.state === "idle" ? "primary" : done ? "success" : "warning";

const lastSyncedAtBadgeColor = computed<BadgeProps["color"]>(() => {
  const lastSyncedAt = state.lastSyncedAt?.getTime();
  const now = Date.now();

  if (!lastSyncedAt || lastSyncedAt > now) return "error";
  if (lastSyncedAt > now - ms("1h")) return "success";
  if (lastSyncedAt > now - ms("1d")) return "primary";
  if (lastSyncedAt > now - ms("1w")) return "warning";

  return "error";
});
</script>
