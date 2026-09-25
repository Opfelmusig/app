<template>
  <SidebarItemWrapper :to="libraryResourceLink(node)" :inset>
    <ArtworkWrapper v-slot="{ iconClass, imageSize, artwork }" :library-resource="node" size="xs">
      <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
      <UIcon v-else :name="resourceIcon(node.type)" :class="iconClass" />
    </ArtworkWrapper>
    <SidebarItemLabel>{{ node.item.name }}</SidebarItemLabel>
    <SidebarItemStar v-if="node.item.personalRating === 1" />
  </SidebarItemWrapper>
</template>

<script lang="ts" setup>
import type { ResolvedDbPlaylist } from "#layers/libcore/app/database/types";

defineProps<{
  node: ResolvedDbPlaylist;
  inset?: number;
}>();
</script>
