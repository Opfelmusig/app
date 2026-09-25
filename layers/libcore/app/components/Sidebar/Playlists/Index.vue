<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon
      to="/resources/library-playlist-folders"
      icon="lucide:layout-grid"
      variant="default"
    >
      All Playlists
    </SidebarItemIcon>
    <SidebarItemWrapper v-if="favoritsPlaylist" :to="libraryResourceLink(favoritsPlaylist)">
      <div
        class="flex aspect-square size-5 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted select-none"
      >
        <UIcon name="lucide:square-star" class="size-4" />
      </div>
      <SidebarItemLabel>{{ favoritsPlaylist.item.name }}</SidebarItemLabel>
    </SidebarItemWrapper>
    <SidebarItemIcon v-if="data?.length === 0" icon="lucide:list-music" variant="disabled">
      No Playlists
    </SidebarItemIcon>
    <template v-else-if="data">
      <template v-for="child in data" :key="child.item.id">
        <SidebarPlaylistsNode
          v-if="
            child.type === 'library-playlists' &&
            !child.item.tags.includes('favorited') &&
            child.item.name
          "
          :node="child"
        />
        <SidebarPlaylistsFolderNode
          v-else-if="child.type === 'library-playlist-folders' && child.item.name"
          :node="child"
        />
      </template>
    </template>
    <SidebarItemIcon
      v-else-if="isLoading || asyncStatus === 'loading'"
      icon="lucide:loader-circle"
      spin
      variant="disabled"
    >
      Loading Playlists
    </SidebarItemIcon>
  </div>
</template>

<script lang="ts" setup>
const { isLoading } = useLibrary();
const { data, asyncStatus } = useLibraryTree();

const favoritsPlaylist = computed(() =>
  data.value?.find(
    (child) => child.type === "library-playlists" && child.item.tags.includes("favorited"),
  ),
);
</script>
