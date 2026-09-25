<template>
  <SettingsWrapper>
    <SettingsConfig no-label label="Sync Library" description="This can take a while" :error>
      <UButton
        color="warning"
        variant="soft"
        icon="lucide:folder-sync"
        label="Sync Now"
        :disabled="state.initializing"
        :loading="state.syncing"
        @click="sync"
      />
    </SettingsConfig>
    <SettingsConfig no-label label="Last Synced">
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
    <USeparator />
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
import type { BadgeProps } from "@nuxt/ui";
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import ms from "ms";

import type { UBadge } from "#components";

const openingDataDirectory = ref(false);

async function openDataDirectory() {
  openingDataDirectory.value = true;
  try {
    await openPath(await appDataDir());
  } finally {
    openingDataDirectory.value = false;
  }
}

const { data: stats } = useLibraryStats();
const { sync, state, progress, error } = useLibrary();

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
