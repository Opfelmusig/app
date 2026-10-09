<template>
  <div class="flex w-full flex-col gap-1">
    <SidebarItemIcon to="/resources/library-playlist-folders" icon="lucide:layout-grid">
      All Playlists
    </SidebarItemIcon>
    <SidebarItemWrapper v-if="favoritsPlaylist" :to="resourceLink(favoritsPlaylist)">
      <div
        class="flex aspect-square size-5 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted select-none"
      >
        <UIcon name="lucide:square-star" class="size-4" />
      </div>
      <SidebarItemLabel>{{ favoritsPlaylist.attributes.name }}</SidebarItemLabel>
    </SidebarItemWrapper>
    <SidebarItemIcon v-if="children?.length === 0" icon="lucide:list-music" variant="disabled">
      No Playlists
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
        {{ overflow }} More
      </SidebarItemIcon>
    </template>
    <SidebarItemIcon
      v-else-if="isLoading || asyncStatus === 'loading'"
      icon="lucide:loader-circle"
      spin
      variant="disabled"
    >
      Loading Playlists
    </SidebarItemIcon>

    {{ error }}
  </div>
</template>

<script lang="ts" setup>
const { isLoading, client } = useLibrary();
const { data, asyncStatus, error } = useLibraryQuery({
  key: ["tree"],
  query: () => client.getFolderTree(),
});

const favoritsPlaylist = computed(() =>
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
