<template>
  <div class="flex size-full flex-col items-start gap-2 p-8">
    <div class="flex gap-2">
      <UButton
        color="warning"
        :disabled="state.initializing"
        :loading="state.syncing"
        @click="sync"
      >
        Sync Library
      </UButton>
    </div>
    <span v-if="error" class="text-error">{{ error.name }}: {{ error.message }}</span>
    <span>Sync Progress: {{ progress.state }}</span>
    <span v-if="state.lastSyncedAt" class="text-sm text-muted">
      Last Synced:
      <NuxtTime :datetime="state.lastSyncedAt" relative numeric="auto" relative-style="long" />
    </span>
    <div class="flex flex-col gap-2 pl-4 text-sm text-muted">
      <span>Songs: {{ progress.songs }}</span>
      <span>Albums: {{ progress.albums }}</span>
      <span>Artists: {{ progress.artists }}</span>
      <span>Playlists: {{ progress.playlists }}</span>
    </div>
    <span>Stats</span>
    <div class="flex flex-col gap-2 pl-4 text-sm text-muted">
      <span>Songs: {{ stats?.songs ?? 0 }}</span>
      <span>Albums: {{ stats?.albums ?? 0 }}</span>
      <span>Artists: {{ stats?.artists ?? 0 }}</span>
      <span>Playlists: {{ stats?.playlists ?? 0 }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data: stats } = useLibraryStats();
const { sync, state, progress, error } = useLibrary();
</script>
