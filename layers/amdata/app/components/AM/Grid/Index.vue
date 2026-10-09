<template>
  <AMGridWrapper>
    <AMGridItem
      v-for="item in items"
      :key="item.key"
      :resource="item.resource"
      :show-artists
      :show-year
    />
  </AMGridWrapper>
</template>

<script lang="ts" setup>
import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmListResource } from "#layers/amdata/app/types/resources";

defineProps<{
  items?: AmListResource<AmLibraryAlbum | AmLibraryPlaylist | AmLibraryArtist>[];
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
