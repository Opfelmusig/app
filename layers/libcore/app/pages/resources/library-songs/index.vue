<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <AMControlsSorting
        v-model="sortBy"
        v-model:direction="direction"
        :items="librarySongSorting"
        :active="sortChanged"
        @reset="resetSorting"
      />
      <AMControlsFilters :active="changed" @click="resetFilters">
        <AMControlsFiltersItem v-model="selectedRatings" label="Rating" :items="songRatingFilter" />
        <AMControlsFiltersItem
          v-model="selectedContentRatings"
          label="Content Rating"
          :items="songContentRatingFilter"
        />
        <AMControlsFiltersSection label="Type">
          <UCheckbox v-model="isUploaded" label="Is uploaded" />
        </AMControlsFiltersSection>
      </AMControlsFilters>
      <AMControlsColumns
        v-model="columns"
        :items="songColumns"
        :active="columnsChanged"
        @reset="reset"
      />
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
    <AMSongs :songs="displayedSongs" :columns />
    <AMFooter>
      <span>
        <AMFooterCount :count="displayedSongs?.length ?? 0" singular="album" />,
        <span>
          {{ tracksDuration(displayedSongs) }}
        </span>
      </span>
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/columns";
import { songContentRatingFilter, songRatingFilter } from "#layers/amdata/app/lib/filters";
import { librarySongSorting } from "#layers/amdata/app/lib/sorting";
import type { SongColumns, SongSort } from "#layers/amdata/app/types/songs";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs } = useLibraryList(DbListId.Songs);

const { columns, reset, columnsChanged } = useColumns<SongColumns>(
  DbListId.Songs,
  defaultSongColumns,
);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<SongSort>(DbListId.Songs, "default");

const {
  filters,
  selectedRatings,
  selectedContentRatings,
  isUploaded,
  changed,
  reset: resetFilters,
} = useSongFilters();

const search = ref("");
const searchedSongs = useSearchableSongs(songs, search);

const displayedSongs = computed(() => {
  const filteredSongs = filterSongs(searchedSongs.value, filters.value);

  return sortSongs(filteredSongs, sortBy.value, direction.value);
});
</script>
