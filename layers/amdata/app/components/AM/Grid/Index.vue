<template>
  <template v-for="item in items" :key="item.key">
    <AMGridItem
      v-if="item.resourceType !== 'library-playlist-folders'"
      :resource="item"
      :show-artists
      :show-year
    />
    <AMGridFolderItem v-else :resource="item" />
  </template>
</template>

<script lang="ts" setup>
defineProps<{
  items?: AmListResource<
    AmAlbum | AmPlaylist | AmArtist | AmLibraryPlaylistFolder | AmSocialProfile | AmCatalogStation
  >[];
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
