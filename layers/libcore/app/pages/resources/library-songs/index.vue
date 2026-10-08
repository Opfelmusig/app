<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <AMControlsSorting
        v-model="sortBy"
        v-model:direction="direction"
        :items="LibrarySongSorting"
        :active="sortChanged"
        @reset="resetSorting"
      />
      <OMMenu
        icon="lucide:filter"
        :active="selectedRatings.length > 0 || selectedContentRatings.length > 0"
        fill
      >
        <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
          <span class="text-sm text-muted">Rating</span>
          <UCheckboxGroup
            v-model="selectedRatings"
            :ui="{ fieldset: 'gap-2' }"
            :items="ratingOptions"
            value-key="rating"
          />
        </div>
        <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
          <span class="text-sm text-muted">Content Rating</span>
          <UCheckboxGroup
            v-model="selectedContentRatings"
            :ui="{ fieldset: 'gap-2' }"
            :items="contentRatingOptions"
          />
        </div>
        <USeparator />
        <div class="flex w-48 flex-col gap-2 p-1">
          <UButton
            label="Reset filters"
            class="gap-2 rounded-b-lg"
            variant="ghost"
            color="error"
            icon="lucide:corner-up-left"
            :disabled="selectedRatings.length === 0 && selectedContentRatings.length === 0"
            :ui="{
              leadingIcon: 'size-4',
            }"
            @click="resetFilters"
          />
        </div>
      </OMMenu>
      <AMControlsColumns
        v-model="columns"
        :items="options"
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
    <LibraryFooter>
      <span>
        <span>
          {{ displayedSongs?.length ?? 0 }}/{{ songs?.length ?? 0 }}
          {{ songs?.length === 1 ? "song" : "songs" }},
        </span>
        <span>
          {{ tracksDuration(displayedSongs) }}
        </span>
      </span>
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import type { ContentRating } from "@opfelmusig/lib/types";
import { useFuse } from "@vueuse/integrations/useFuse";

import type { SongSort } from "#layers/amdata/app/types/songs";
import { LibrarySongSorting } from "#layers/amdata/app/types/sorting";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs } = useLibraryList(DbListId.Songs);

const { columns, options, reset, columnsChanged } = useLibrarySongsColumns(DbListId.Songs);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<SongSort>(DbListId.Songs, "default");

type RatingFilter = 1 | -1 | 0;

const selectedRatings = ref<RatingFilter[]>([]);

const ratingOptions: { label: string; rating: RatingFilter }[] = [
  { label: "Favorited", rating: 1 },
  { label: "Suggest Less", rating: -1 },
  { label: "No rating", rating: 0 },
];

const selectedContentRatings = ref<ContentRating[]>([]);

const contentRatingOptions: { label: string; value: ContentRating }[] = [
  { label: "Explicit", value: "explicit" },
  { label: "Clean", value: "clean" },
];

function resetFilters() {
  selectedRatings.value = [];
  selectedContentRatings.value = [];
}

const search = ref("");

const { results: searchedSongs } = useFuse(search, () => songs.value ?? [], {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [
      { name: "resource.attributes.name", weight: 0.6 },
      { name: "resource.attributes.artistName", weight: 0.25 },
      { name: "resource.attributes.albumName", weight: 0.15 },
    ],
    threshold: 0.4,
  },
});

const displayedSongs = computed(() => {
  const filteredSongs = filterSongs(
    searchedSongs.value.map((song) => song.item),
    selectedRatings.value,
    selectedContentRatings.value,
    false,
  );

  return sortSongs(filteredSongs, sortBy.value, direction.value);
});
</script>
