<template>
  <NuxtLink v-if="link" :to="link" class="flex items-center gap-1 hover:underline">
    <span>Open Catalog</span>
    <UIcon name="lucide:arrow-up-right" class="size-3 text-dimmed" />
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";

const props = defineProps<{
  resource?: AmLibraryAlbum | AmLibraryArtist | AmLibraryPlaylist;
}>();

const link = computed(() => resourceRelationLink(props.resource));
</script>
