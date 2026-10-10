<template>
  <SidebarItemWrapper :to="resourceLink(node)" :inset>
    <AMArtworkWrapper :resource="node" size="xs">
      <AMArtworkImage />
      <AMArtworkPlaceholder />
    </AMArtworkWrapper>
    <SidebarItemLabel>{{ node.attributes.name }}</SidebarItemLabel>
    <SidebarItemStar v-if="node.attributes.personalRating === 1" />
  </SidebarItemWrapper>
</template>

<script lang="ts" setup>
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";

defineProps<{
  node: AmLibraryPlaylist;
  inset?: number;
}>();
</script>
