<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <AMControlsSorting
        v-model="sortBy"
        v-model:direction="direction"
        :items="libraryAlbumSorting"
        :active="sortChanged"
        @reset="resetSorting"
      />
      <OMButtonSecondary fill icon="lucide:filter" />
      <UInput
        v-model="search"
        variant="soft"
        color="neutral"
        icon="lucide:search"
        placeholder="Search..."
        class="shrink-0"
        :ui="{ base: 'h-9 rounded-xl' }"
      />
      <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
    </header>
    <AMGrid :items="displayedAlbums" show-artists />
    <AMFooter>
      <AMFooterCount :count="displayedAlbums?.length ?? 0" singular="album" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { libraryAlbumSorting } from "#layers/amdata/app/lib/sorting";
import type { AlbumSort } from "#layers/amdata/app/types/albums";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: albums } = useLibraryList(DbListId.Albums);
const search = ref("");
const searchedAlbums = useSearchableAlbums(albums, search);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<AlbumSort>(() => DbListId.Albums, "default");

const displayedAlbums = computed(() => {
  return sortAlbums(searchedAlbums.value, sortBy.value, direction.value);
});
</script>
