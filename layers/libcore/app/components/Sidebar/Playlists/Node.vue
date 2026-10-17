<template>
  <SidebarResourceMenu :resource="createListResource(node, 'sidebar-playlists', 0)">
    <SidebarItemWrapper :to="resourceLink(node)" :inset>
      <AMArtworkWrapper :resource="node" context="small">
        <AMArtworkImage />
        <AMArtworkPlaceholder />
      </AMArtworkWrapper>
      <SidebarItemLabel>{{ node.attributes.name }}</SidebarItemLabel>
      <SidebarItemStar v-if="node.attributes.personalRating === 1" />
    </SidebarItemWrapper>
  </SidebarResourceMenu>
</template>

<script lang="ts" setup>
defineProps<{
  node: AmLibraryPlaylist;
  inset?: number;
}>();
</script>
