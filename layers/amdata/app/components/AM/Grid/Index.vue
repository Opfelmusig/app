<template>
  <template v-for="(item, i) in items" :key="`${item.id}:${i}`">
    <AMGridItem
      v-if="item.type !== 'library-playlist-folders'"
      :resource="item"
      :show-artists
      :show-year
    />
    <AMGridFolderItem v-else :resource="item" />
  </template>
</template>

<script lang="ts" setup>
defineProps<{
  items?: (
    | AmAlbum
    | AmPlaylist
    | AmArtist
    | AmLibraryPlaylistFolder
    | AmSocialProfile
    | AmCatalogStation
  )[];
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
