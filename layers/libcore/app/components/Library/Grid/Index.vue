<template>
  <LibraryGridWrapper>
    <LibraryGridItem
      v-for="item in items"
      :key="item.entry.id"
      :resource="item.resource"
      show-artists
    />
  </LibraryGridWrapper>
</template>

<script lang="ts" setup>
import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";
import type { ResolvedDbListResource } from "#layers/libcore/app/database/types";

defineProps<{
  items?: ResolvedDbListResource<AmLibraryAlbum | AmLibraryPlaylist | AmLibraryArtist>[];
}>();
</script>
