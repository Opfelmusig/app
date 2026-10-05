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
import type {
  ResolvedDbAlbum,
  ResolvedDbArtist,
  ResolvedDbListResource,
  ResolvedDbPlaylist,
} from "#layers/libcore/app/database/types";

defineProps<{
  items?: ResolvedDbListResource<ResolvedDbAlbum | ResolvedDbPlaylist | ResolvedDbArtist>[];
}>();
</script>
