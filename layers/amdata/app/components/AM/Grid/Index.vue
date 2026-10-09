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
import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmListResource } from "#layers/amdata/app/types/resources";

defineProps<{
  items?: AmListResource<
    AmAlbum | AmPlaylist | AmArtist | AmLibraryPlaylistFolder | AmSocialProfile
  >[]; // stations
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
