<template>
  <div class="p-8 flex flex-col gap-2 items-start size-full">
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
    <div class="flex flex-col h-100 overflow-auto p-2 px-3 rounded-md bg-muted/20 gap-2">
      <div v-for="song in songs" :key="song.id" class="flex gap-2 items-center">
        <img
          v-if="song.artwork"
          :src="getArtworkUrl(song.artwork, { width: 128 })"
          class="size-12 rounded-lg"
        />
        <div v-else class="size-12 rounded-lg bg-muted" />
        <div class="flex flex-col max-w-100 whitespace-nowrap min-w-0">
          <span class="truncate">{{ song.name }}</span>
          <span class="text-sm text-muted truncate">
            {{ song.albumName }} - {{ song.artistName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const { profile, logout, profileId } = useAuth();
const { data: songs } = useLibrarySongs();
const { data: stats } = useLibraryStats();
const { sync, state, progress, error } = useLibrary();
</script>
