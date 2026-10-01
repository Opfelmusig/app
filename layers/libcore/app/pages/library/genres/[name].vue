<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4">
      <div class="flex min-w-0 items-center gap-2">
        <h2 class="truncate">
          {{ name }}
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <OMButtonPlay />
        <OMButtonSecondary icon="lucide:shuffle" />
        <OMButtonSeparator />
        <OMButtonSecondary icon="lucide:arrow-up-down" />
        <OMButtonSecondary fill icon="lucide:filter" />
        <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
      </div>
    </header>
    <LibraryGridWrapper :count="albums?.length">
      <LibraryGridItem v-for="album in albums" :key="album.item.id" :resource="album" show-year />
    </LibraryGridWrapper>
    <LibraryFooter>
      <span>{{ albums?.length ?? 0 }} {{ albums?.length === 1 ? "album" : "albums" }}</span>
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
const name = useRouteParams<string>("name");
const { data: albums } = useLibraryGenreAlbums(name);
</script>
