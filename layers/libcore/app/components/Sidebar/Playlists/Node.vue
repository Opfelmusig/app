<template>
  <SidebarItemWrapper :to="resourceLink(node)" :inset>
    <AMArtworkWrapper v-slot="{ iconClass, imageSize, artwork }" :resource="node" size="xs">
      <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
      <UIcon v-else :name="resourceIcon(node.type)" :class="iconClass" />
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
