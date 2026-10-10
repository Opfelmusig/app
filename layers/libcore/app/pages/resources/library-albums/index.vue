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
      <AMControlsFilters :active="changed" @reset="resetFilters">
        <AMControlsFiltersItem v-model="selectedRatings" label="Rating" :items="ratingFilter" />
        <AMControlsFiltersItem
          v-model="selectedContentRatings"
          label="Content Rating"
          :items="contentRatingFilter"
        />
        <AMControlsFiltersSection label="Type">
          <UCheckbox v-model="isUploaded" label="Is uploaded" />
        </AMControlsFiltersSection>
      </AMControlsFilters>
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
      <AMFooterCount :count="displayedAlbums?.length" singular="album" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/filters";
import { albumSearchKeys } from "#layers/amdata/app/lib/search";
import { libraryAlbumSorting } from "#layers/amdata/app/lib/sorting";
import type { AlbumSort } from "#layers/amdata/app/types/albums";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: albums } = useLibraryList(DbListId.Albums);
const search = ref("");
const searchedAlbums = useSearch(albums, search, albumSearchKeys);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<AlbumSort>(() => DbListId.Albums, "default");

const {
  filters,
  selectedRatings,
  selectedContentRatings,
  isUploaded,
  changed,
  reset: resetFilters,
} = useFilters();

const displayedAlbums = computed(() => {
  const filteredAlbums = filterResources(searchedAlbums.value, filters.value);

  return sortAlbums(filteredAlbums, sortBy.value, direction.value);
});
</script>
