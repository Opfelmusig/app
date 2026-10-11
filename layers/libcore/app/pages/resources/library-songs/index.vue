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
    <AMSongsWrapper :columns>
      <AMSongsStatus
        :is-pending="songsPending"
        :error="songsError"
        :total="songs?.length"
        :songs="displayedSongs"
      >
        <AMSongs :songs="displayedSongs" @play="play" />
      </AMSongsStatus>
    </AMSongsWrapper>
    <AMFooter>
      <span>
        <AMFooterCount :count="displayedSongs?.length" singular="album" />,
        <span>
          {{ tracksDuration(displayedSongs) }}
        </span>
      </span>
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/filters";
import { songSearchKeys } from "#layers/amdata/app/lib/search";
import { librarySongSorting } from "#layers/amdata/app/lib/sorting";
import type { SongColumns, SongSort } from "#layers/amdata/app/types/songs";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs, isPending: songsPending, error: songsError } = useLibraryList(DbListId.Songs);

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
} = useFilters();

const search = ref("");
const searchedSongs = useSearch(songs, search, songSearchKeys);

const displayedSongs = computed(() => {
  const filteredSongs = filterResources(searchedSongs.value, filters.value);

  return sortSongs(filteredSongs, sortBy.value, direction.value);
});

const queueStore = useQueueStore();

function play(index: number = 0) {
  if (displayedSongs.value.length === 0) return;

  queueStore.playQueue({
    index,
    tracks: displayedSongs.value,
  });
}
</script>
