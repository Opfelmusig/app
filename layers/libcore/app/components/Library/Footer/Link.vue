<template>
  <NuxtLink v-if="link" :to="link" class="flex items-center gap-1 hover:underline">
    <span>Open Catalog</span>
    <UIcon name="lucide:arrow-up-right" class="size-3 text-dimmed" />
  </NuxtLink>
</template>

<script lang="ts" setup>
import type {
  ResolvedDbAlbum,
  ResolvedDbArtist,
  ResolvedDbPlaylist,
} from "#layers/libcore/app/database/types";

const props = defineProps<{
  resource?: ResolvedDbAlbum | ResolvedDbArtist | ResolvedDbPlaylist;
}>();

const link = computed(() => {
  switch (props.resource?.type) {
    case "library-albums":
      return `/resources/albums/${props.resource.item.catalogId}`;
    case "library-artists":
      return `/resources/artists/${props.resource.item.catalogId}`;
    case "library-playlists":
      return `/resources/playlists/${props.resource.item.catalogId}`;
  }
});
</script>
