<template>
  <template v-for="item in items" :key="item.key">
    <template v-if="item.resource.attributes.name">
      <AMGridItem
        v-if="item.resourceType !== 'library-playlist-folders'"
        :resource="item"
        :show-artists
        :show-year
      />
      <AMGridFolderItem v-else :resource="item" />
    </template>
  </template>
</template>

<script lang="ts" setup>
import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmListResource } from "#layers/amdata/app/types/resources";

defineProps<{
  items?: AmListResource<
    AmAlbum | AmPlaylist | AmArtist | AmLibraryPlaylistFolder | AmSocialProfile | AmCatalogStation
  >[];
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
