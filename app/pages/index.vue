<template>
  <div class="p-8 flex flex-col gap-2 items-start size-full" data-tauri-drag-region>
    <h1>{{ profile?.attributes?.name }}@{{ profile?.attributes?.handle }}</h1>
    <span>{{ profileId }}</span>
    <div class="flex gap-2">
      <UButton @click="logout">Logout</UButton>
      <UButton
        color="warning"
        :disabled="state.initializing"
        :loading="state.syncing"
        @click="sync"
      >
        {{ statusText }}
      </UButton>
    </div>
    <span>Scan Progress: {{ progress.state }}</span>
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
    <div class="flex flex-col">
      <span v-for="song in data" :key="song.resource_id">{{ song.name }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { profile, logout, profileId } = useAuth();
const { data } = useLibrarySongs();
const { sync, state, progress } = useLibrary();

const statusText = computed(() => {
  if (state.initializing) return "Initializing Library";
  if (state.ready && state.syncing) return "Syncing Library in the background";
  if (!state.ready && state.syncing) return "Syncing Library";
  if (!state.ready && !state.syncing) return "Library not Ready";

  return "Sync Library";
});
</script>
