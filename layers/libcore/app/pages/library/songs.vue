<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <OMButtonSecondary icon="lucide:arrow-up-down" />
      <OMMenu icon="lucide:filter">
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
      </OMMenu>
      <OMMenu icon="lucide:columns-3">
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

const { data: songs } = useLibraryList(DbListId.Songs);

const { columns, options, reset } = useLibrarySongsColumns(DbListId.Songs);

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
  return searchedSongs.value
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
});
</script>
