<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <OMMenu icon="lucide:arrow-up-down" :active="sortChanged">
        <div class="flex gap-1 p-1">
          <UButton
            v-for="direction in directions"
            :key="direction"
            :variant="sort.direction === direction ? 'soft' : 'ghost'"
            :leading-icon="direction === 'asc' ? 'lucide:chevron-down' : 'lucide:chevron-up'"
            :aria-label="direction === 'asc' ? 'Ascending' : 'Descending'"
            :aria-pressed="sort.direction === direction"
            class="w-full justify-center rounded-sm first:rounded-tl-lg last:rounded-tr-lg"
            color="neutral"
            :ui="{ leadingIcon: 'size-4' }"
            @click="sort.direction = direction"
          />
        </div>
        <USeparator />
        <div class="flex w-48 flex-col gap-2 p-2 px-2.5">
          <URadioGroup
            v-model="sort.by"
            :ui="{ fieldset: 'gap-2' }"
            :items="sortOptions"
            aria-label="Sort songs by"
          />
        </div>
        <USeparator />
        <div class="flex w-48 flex-col gap-2 p-1">
          <UButton
            label="Reset sorting"
            class="gap-2 rounded-b-lg"
            variant="ghost"
            color="error"
            icon="lucide:corner-up-left"
            :disabled="!sortChanged"
            :ui="{ leadingIcon: 'size-4' }"
            @click="resetSorting"
          />
        </div>
      </OMMenu>
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
      <OMMenu icon="lucide:columns-3" :active="columnsChanged">
        <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
          <span class="text-sm text-muted">Columns</span>
          <UCheckboxGroup v-model="columns" :ui="{ fieldset: 'gap-2' }" :items="options" />
        </div>
        <USeparator />
        <div class="flex w-48 flex-col gap-2 p-1">
          <UButton
            label="Reset columns"
            class="gap-2 rounded-b-lg"
            variant="ghost"
            color="error"
            icon="lucide:corner-up-left"
            :disabled="!columnsChanged"
            :ui="{
              leadingIcon: 'size-4',
            }"
            @click="reset"
          />
        </div>
      </OMMenu>
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
    <LibrarySongs :songs="displayedSongs" :columns />
    <LibraryFooter>
      <span>
        <span>
          {{ displayedSongs?.length ?? 0 }}/{{ songs?.length ?? 0 }}
          {{ songs?.length === 1 ? "song" : "songs" }},
        </span>
        <span>
          {{ libraryTracksDuration(displayedSongs) }}
        </span>
      </span>
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import type { ContentRating } from "@opfelmusig/lib/types";
import { useFuse } from "@vueuse/integrations/useFuse";

import { DbListId } from "#layers/libcore/app/database/types";
import sortLibrarySongs from "#layers/libcore/app/utils/sortLibrarySongs";

const { data: songs } = useLibraryList(DbListId.Songs);

const { columns, options, reset, columnsChanged } = useLibrarySongsColumns(DbListId.Songs);

const {
  sort,
  sortChanged,
  options: sortOptions,
  reset: resetSorting,
} = useLibrarySongsSorting(DbListId.Songs);

const directions = ["asc", "desc"] as const;

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
      { name: "resource.item.name", weight: 0.6 },
      { name: "resource.item.artistName", weight: 0.25 },
      { name: "resource.item.albumName", weight: 0.15 },
    ],
    threshold: 0.4,
  },
});

const displayedSongs = computed(() => {
  const filteredSongs = searchedSongs.value
    .map((entry) => entry.item)
    .filter(({ resource }) => {
      return (
        selectedRatings.value.length === 0 ||
        selectedRatings.value.includes(resource.item.personalRating ?? 0)
      );
    })
    .filter(({ resource }) => {
      return (
        selectedContentRatings.value.length === 0 ||
        selectedContentRatings.value.includes(resource.item.contentRating ?? "clean")
      );
    });

  return sortLibrarySongs(filteredSongs, sort.value);
});
</script>
