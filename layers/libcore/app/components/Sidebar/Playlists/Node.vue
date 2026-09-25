<template>
  <SidebarItemWrapper :to="libraryResourceLink(node)" :inset>
    <UIcon
      v-if="node.item.personalRating === 1"
      name="lucide:star"
      class="absolute size-2 shrink-0 -translate-x-4 text-primary transition-transform [&>path]:fill-current"
      mode="svg"
    />
    <ArtworkWrapper v-slot="{ iconClass, imageSize, artwork }" :library-resource="node" size="xs">
      <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
      <UIcon v-else :name="resourceIcon(node.type)" :class="iconClass" />
    </ArtworkWrapper>
    <SidebarItemLabel>{{ node.item.name }}</SidebarItemLabel>
  </SidebarItemWrapper>
</template>

<script lang="ts" setup>
import type { ResolvedDbPlaylist } from "#layers/libcore/app/database/types";

defineProps<{
  node: ResolvedDbPlaylist;
  inset?: number;
}>();
</script>
