<template>
  <SettingsWrapper>
    <SettingsSection title="Library">
      <SettingsConfig no-label label="Sync library" description="This can take a while." :error>
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
      <div class="flex flex-col gap-2">
        <SettingsConfig no-label label="Songs">
          <UBadge variant="soft" :color="badgeColor(progress.songs.done)">
            {{ progress.state === "idle" ? (stats?.songs ?? 0) : progress.songs.count }}
          </UBadge>
        </SettingsConfig>
        <SettingsConfig no-label label="Albums">
          <UBadge variant="soft" :color="badgeColor(progress.albums.done)">
            {{ progress.state === "idle" ? (stats?.albums ?? 0) : progress.albums.count }}
          </UBadge>
        </SettingsConfig>
        <SettingsConfig no-label label="Artists">
          <UBadge variant="soft" :color="badgeColor(progress.artists.done)">
            {{ progress.state === "idle" ? (stats?.artists ?? 0) : progress.artists.count }}
          </UBadge>
        </SettingsConfig>
        <SettingsConfig no-label label="Playlists">
          <UBadge variant="soft" :color="badgeColor(progress.playlists.done)">
            {{ progress.state === "idle" ? (stats?.playlists ?? 0) : progress.playlists.count }}
          </UBadge>
        </SettingsConfig>
      </div>
    </SettingsSection>
    <SettingsSection title="Data">
      <SettingsConfig no-label label="Cached data" :error="cacheError">
        <UButton
          color="warning"
          variant="soft"
          icon="lucide:refresh-cw"
          label="Invalidate cache"
          :loading="invalidatingCache"
          @click="invalidateCache"
        />
      </SettingsConfig>
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
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

import type { UBadge } from "#components";

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
