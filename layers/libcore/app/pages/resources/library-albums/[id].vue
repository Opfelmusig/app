<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <AMArtworkWrapper :resource="album" context="header">
        <AMMediaEditorialVideo :editorial-video="album?.attributes.editorialVideo" variant="square">
          <template #fallback>
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </template>
        </AMMediaEditorialVideo>
      </AMArtworkWrapper>
      <div v-if="album" class="flex w-full flex-col justify-end gap-4">
        <div class="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
          <h2>{{ album.attributes.name }}</h2>
          <div class="flex items-center gap-2 text-sm text-muted">
            <AMLinks
              :links="album.attributes.artists"
              type="artists"
              :fallback-name="album.attributes.artistName"
              :fallback-id="album.extras.artistId"
            />
            <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
            <span v-if="album.attributes.releaseDate" class="truncate">
              Released
              <AMReleaseDate :release-date="album.attributes.releaseDate" date-style="long" />
            </span>
            <div
              v-if="album.attributes.releaseDate"
              class="size-1 shrink-0 rounded-full bg-accented first:hidden"
            />
            <span v-if="album.attributes.genreNames.length > 0" class="truncate">
              {{ album.attributes.genreNames.join(", ") }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <OMButtonPlay @click="play" />
          <OMButtonSecondary icon="lucide:shuffle" @click="play(0, true)" />
          <OMButtonSecondary
            fill
            icon="lucide:star"
            :active="album.attributes.personalRating === 1"
          />
          <OMButtonSeparator />
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="albumSongSorting"
            :active="sortChanged"
            @reset="resetSorting"
          />
          <AMControlsFilters :active="changed" @reset="resetFilters">
            <AMControlsFiltersItem v-model="selectedRatings" label="Rating" :items="ratingFilter" />
            <AMControlsFiltersItem
              v-model="selectedContentRatings"
              label="Content rating"
              :items="contentRatingFilter"
            />
            <AMControlsFiltersSection label="Type">
              <UCheckbox v-model="isUploaded" label="Uploaded" />
            </AMControlsFiltersSection>
          </AMControlsFilters>
          <AMControlsColumns
            v-model="columns"
            :items="songColumns"
            :active="columnsChanged"
            @reset="reset"
          />
          <OMButtonTertiary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </div>
    </header>
    <AMSongsWrapper :columns>
      <AMSongsStatus
        :is-pending="tracksPending"
        :error="tracksError"
        :total="tracks?.length"
        :songs="displayedTracks"
      >
        <AMSongs :songs="displayedTracks" album-mode :album-sort="!sortChanged" @play="play" />
      </AMSongsStatus>
    </AMSongsWrapper>
    <AMFooter>
      <span>
        <AMFooterCount :count="displayedTracks?.length" singular="song" />,
        <span>
          {{ tracksDuration(displayedTracks) }}
        </span>
      </span>

      <AMFooterLink :resource="album" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { songColumns } from "#layers/amdata/app/lib/controls/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/controls/filters";
import { albumSongSorting } from "#layers/amdata/app/lib/controls/sorting";

const library = useLibrary();
const id = useRouteParams<string>("id");

const { data: album } = useLibraryQuery({
  key: () => ["album", id.value, "resource"],
  query: () => library.client.getAlbum(id.value),
});
const {
  data: tracks,
  isPending: tracksPending,
  error: tracksError,
} = useLibraryQuery({
  key: () => ["albums", id.value, "tracks"],
  query: () => library.client.getAlbumTracks(id.value),
});

const { columns, reset, columnsChanged } = useColumns(
  () => `album:${id.value}`,
  ["artist", "length"],
);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<SongSort>(() => `album:${id.value}`, "discAndTrackNumber");

const {
  filters,
  selectedRatings,
  selectedContentRatings,
  isUploaded,
  changed,
  reset: resetFilters,
} = useFilters();

const displayedTracks = computed(() => {
  const filteredSongs = filterResources(tracks.value ?? [], filters.value);

  return sortSongs(filteredSongs, sortBy.value, direction.value);
});

const queueStore = useQueueStore();

function play(index: number = 0, shuffle: boolean = false) {
  if (!album.value || displayedTracks.value.length === 0) return;

  queueStore.playContext(
    {
      index,
      context: album.value,
      tracks: displayedTracks.value,
    },
    shuffle,
  );
}
</script>
