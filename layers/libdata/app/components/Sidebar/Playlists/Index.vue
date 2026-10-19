<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon to="/resources/library-playlist-folders" icon="lucide:layout-grid">
      All playlists
    </SidebarItemIcon>
    <SidebarResourceMenu
      v-if="favoritesPlaylist"
      :resource="createListResource(favoritesPlaylist, 'sidebar-playlists', 0)"
    >
      <SidebarItemWrapper :to="resourceLink(favoritesPlaylist)">
        <div
          class="flex aspect-square size-5 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted select-none"
        >
          <UIcon name="lucide:square-star" class="size-4" />
        </div>
        <SidebarItemLabel>{{ favoritesPlaylist.attributes.name }}</SidebarItemLabel>
      </SidebarItemWrapper>
    </SidebarResourceMenu>
    <SidebarItemIcon v-if="children?.length === 0" icon="lucide:list-music" variant="disabled">
      No playlists
    </SidebarItemIcon>
    <template v-else-if="children">
      <template v-for="child in children" :key="child.item.id">
        <SidebarPlaylistsNode v-if="!('children' in child)" :node="child.item" />
        <SidebarPlaylistsFolderNode v-else :node="child" />
      </template>

      <SidebarItemIcon
        v-if="overflow"
        icon="lucide:ellipsis"
        to="/resources/library-playlist-folders"
      >
        {{ overflow }} more
      </SidebarItemIcon>
    </template>
    <SidebarItemIcon v-else-if="isPending" icon="lucide:loader-circle" spin variant="disabled">
      Loading playlists
    </SidebarItemIcon>

    {{ error }}
  </div>
</template>

<script lang="ts" setup>
const { data, isPending, error } = useLibraryTree();

const favoritesPlaylist = computed(() =>
  data.value
    ?.map((child) => child.item)
    .filter((item) => item.type === "library-playlists")
    .find((item) => item.extras.tags.includes("favorited")),
);

const filteredChildren = computed(() =>
  data.value?.filter(
    (child) =>
      child.item.type === "library-playlist-folders" ||
      !child.item.extras.tags.includes("favorited"),
  ),
);
const children = computed(() => filteredChildren.value?.slice(0, 25));
const overflow = computed(() =>
  filteredChildren.value?.length ? Math.max(filteredChildren.value?.length - 25, 0) : undefined,
);
</script>
