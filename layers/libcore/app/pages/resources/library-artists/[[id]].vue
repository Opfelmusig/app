<template>
  <div class="flex size-full overflow-hidden">
    <div class="relative flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 border-b border-default p-2">
        <OMButtonSecondary
          icon="lucide:arrow-up-down"
          :active="descending"
          @click="descending = !descending"
        />
        <AMControlsFilters :active="filtersChanged" @reset="resetFilters">
          <AMControlsFiltersItem v-model="selectedRatings" label="Rating" :items="ratingFilter" />
          <AMControlsFiltersSection label="Artist">
            <UCheckbox v-model="hasCatalog" label="Available in the catalog" />
          </AMControlsFiltersSection>
        </AMControlsFilters>
        <UInput
          v-model="search"
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          :ui="{ base: 'h-9 rounded-xl' }"
        />
        <OMButtonTertiary icon="lucide:ellipsis" />
      </header>
      <div class="flex cursor-pointer flex-col text-sm select-none">
        <NuxtLink
          v-for="artist in displayedArtists"
          :key="artist.key"
          class="group flex h-14 items-center gap-2 border-b border-default px-2 last:border-b-0 hover:bg-raised route:bg-muted/40 [&:active:not(:has(.no-active:active))]:bg-muted/60"
          :to="rawResourceLink('library-artists', artist.resource.id)"
        >
          <AMArtworkWrapper :resource="artist" context="list" color="muted">
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </AMArtworkWrapper>
          <div class="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <span class="truncate">
              {{ artist.resource.attributes.name }}
            </span>
            <OMStar v-if="artist.resource.attributes.personalRating === 1" />
          </div>
          <OMButtonTertiary icon="lucide:ellipsis" class="no-active text-muted" @click.prevent />
        </NuxtLink>
      </div>
      <AMFooter>
        <AMFooterCount :count="displayedArtists.length" singular="artist" />
      </AMFooter>
    </div>
    <USeparator orientation="vertical" />
    <PageWrapper v-if="id">
      <header class="flex flex-col gap-4 p-4">
        <div class="flex min-w-0 items-center gap-2">
          <AMArtworkWrapper :resource="currentArtist" context="list" color="muted">
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </AMArtworkWrapper>
          <h2 class="truncate">
            {{ currentArtist?.attributes.name ?? "Not found" }}
          </h2>
          <OMStar v-if="currentArtist?.attributes.personalRating === 1" large />
        </div>
        <div class="flex items-center gap-2">
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="artistAlbumSorting"
            :active="sortChanged"
            @reset="resetSorting"
          />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonTertiary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </header>
      <USeparator />
      <AMGridWrapper>
        <AMGridStatus
          :is-pending="currentArtistAlbumsPending"
          :error="currentArtistAlbumsError"
          :total="currentArtistAlbums?.length"
          :resources="displayedAlbums"
        >
          <AMGrid :items="displayedAlbums" show-year />
        </AMGridStatus>
      </AMGridWrapper>
      <AMFooter>
        <AMFooterCount :count="displayedAlbums?.length" singular="album" />

        <AMFooterLink :resource="currentArtist" />
      </AMFooter>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
import { filter, pipe, reverse, sortBy as sortArtists } from "remeda";

import { ratingFilter, type FilterRating } from "#layers/amdata/app/lib/controls/filters";
import { artistSearchKeys } from "#layers/amdata/app/lib/controls/search";
import { artistAlbumSorting } from "#layers/amdata/app/lib/controls/sorting";
import type { AlbumSort } from "#layers/amdata/app/types/albums";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: artists } = useLibraryList(DbListId.Artists);
const search = ref("");
const searchedArtists = useSearch(artists, search, artistSearchKeys);

const descending = ref(false);
const selectedRatings = ref<FilterRating[]>([]);
const hasCatalog = ref(false);
const filtersChanged = computed(() => selectedRatings.value.length > 0 || hasCatalog.value);

function resetFilters() {
  selectedRatings.value = [];
  hasCatalog.value = false;
}

const displayedArtists = computed(() => {
  const selectedRatingValues = selectedRatings.value.map(Number);
  return pipe(
    searchedArtists.value,
    filter((artist) => {
      const rating = artist.resource.attributes.personalRating ?? 0;
      if (selectedRatingValues.length > 0 && !selectedRatingValues.includes(rating)) return false;
      if (hasCatalog.value && !artist.resource.extras.catalogId) return false;

      return true;
    }),
    sortArtists((artist) => artist.position),
    (artists) => (descending.value ? reverse(artists) : artists),
  );
});

const id = useRouteParams<string | undefined>("id");

const library = useLibrary();
const { data: currentArtist } = useLibraryQuery({
  key: () => ["artist", id.value ?? null],
  query: () => library.client.getArtist(id.value!),
  enabled: id,
});
const {
  data: currentArtistAlbums,
  isPending: currentArtistAlbumsPending,
  error: currentArtistAlbumsError,
} = useLibraryQuery({
  key: () => ["artist", id.value ?? null, "albums"],
  query: () => library.client.getArtistAlbums(id.value!),
  enabled: id,
});

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<AlbumSort>(() => `artist:${id.value}:albums`, "title");

const displayedAlbums = computed(() => {
  return sortAlbums(currentArtistAlbums.value ?? [], sortBy.value, direction.value);
});
</script>
