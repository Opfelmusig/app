<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <AMArtworkWrapper :resource="playlist" context="header">
        <AMMediaEditorialVideo
          :editorial-video="playlist?.attributes.editorialVideo"
          variant="square"
        >
          <template #fallback>
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </template>
        </AMMediaEditorialVideo>
      </AMArtworkWrapper>
      <div class="flex w-full min-w-0 flex-col justify-end gap-4">
        <div v-if="playlist" class="flex min-w-0 flex-col gap-1">
          <h2>{{ playlist.attributes.name }}</h2>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span v-if="playlist.attributes.curatorName">
              <NuxtLink
                v-if="playlist.attributes.curatorSocialHandle"
                :to="rawResourceLink('social-profiles', playlist.attributes.curatorSocialHandle)"
                class="hover:underline"
              >
                {{ playlist.attributes.curatorName }}
              </NuxtLink>
              <span v-else>{{ playlist.attributes.curatorName }}</span>
            </span>
            <template v-if="playlist.attributes.lastModifiedDate">
              <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
              <UTooltip :text="playlist.attributes.lastModifiedDate.toLocaleString()" arrow>
                <span>
                  Updated
                  <NuxtTime :datetime="playlist.attributes.lastModifiedDate" relative />
                </span>
              </UTooltip>
            </template>
          </div>
          <p
            v-if="playlist.attributes.description"
            class="line-clamp-2 text-sm whitespace-break-spaces text-dimmed"
          >
            {{ playlist.attributes.description }}
          </p>
        </div>
        <div v-else-if="isPending" class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
          Loading playlist
        </div>
        <div v-else-if="error" class="flex items-center gap-2 text-sm text-error">
          <UIcon name="lucide:x" class="size-4 shrink-0" />
          <span>{{ error.message }}</span>
        </div>
        <p v-else class="text-sm text-muted">Playlist not found.</p>
        <div class="flex items-center gap-2">
          <OMButtonPlay :disabled="!playlist || !displayedTracks.length" @click="play()" />
          <OMButtonSecondary
            icon="lucide:shuffle"
            :disabled="!playlist || !displayedTracks.length"
            @click="play(0, true)"
          />
          <OMButtonSecondary
            v-if="playlist"
            fill
            icon="lucide:star"
            :active="playlist.attributes.personalRating === 1"
          />
          <OMButtonSeparator />
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="defaultSongSorting"
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
            <AMControlsFiltersSection label="Library">
              <UCheckbox v-model="inLibrary" label="In library" />
            </AMControlsFiltersSection>
          </AMControlsFilters>
          <AMControlsColumns
            v-model="columns"
            :items="songColumns"
            :active="columnsChanged"
            @reset="resetColumns"
          />
          <UInput
            v-model="search"
            variant="soft"
            color="neutral"
            icon="lucide:search"
            placeholder="Search..."
            :ui="{ base: 'h-9 rounded-xl' }"
          />
          <OMMenuButton v-if="menuItems.length" :items="menuItems" class="ml-auto" />
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
        <AMSongs :songs="displayedTracks" @play="play" />
      </AMSongsStatus>
    </AMSongsWrapper>
    <AMFooter class="mt-0">
      <span>
        <AMFooterCount :count="displayedTracks.length" singular="song" />,
        {{ tracksDuration(displayedTracks) }}
      </span>
    </AMFooter>
    <USeparator class="last:hidden" />
    <div v-if="playlist" class="flex flex-col gap-8 py-4">
      <AMResourceShelf
        v-for="section in views"
        :key="section.view"
        :title="section.title"
        :items="section.items"
        :see-more-to="
          section.hasMore
            ? {
                path: `/resources/playlists/${id}/views/${section.view}`,
                query: { title: section.title },
              }
            : undefined
        "
      />
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/controls/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/controls/filters";
import { songSearchKeys } from "#layers/amdata/app/lib/controls/search";
import { defaultSongSorting } from "#layers/amdata/app/lib/controls/sorting";
import {
  fetchCatalogPlaylist,
  fetchCatalogPlaylistTracks,
  fetchCatalogPlaylistViews,
} from "#layers/amdata/app/lib/queries/playlists";

const client = useClient();
const id = useRouteParams<string>("id");

const { data, isPending, error } = useAmQuery({
  key: () => ["playlists", id.value, "resource"],
  query: () => fetchCatalogPlaylist(client, id.value),
  staleTime: ms("1h"),
  gcTime: ms("1d"),
});

const { data: views } = useAmQuery({
  key: () => ["playlists", id.value, "views"],
  query: () => fetchCatalogPlaylistViews(client, id.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const playlist = computed(() => data.value?.playlist);

const {
  data: tracks,
  isPending: tracksPending,
  error: tracksError,
} = useAmQuery({
  key: () => ["playlists", id.value, "tracks"],
  query: () => fetchCatalogPlaylistTracks(client, id.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const {
  columns,
  columnsChanged,
  reset: resetColumns,
} = useColumns<SongColumns>(() => `playlists:${id.value}`, defaultSongColumns);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<SongSort>(() => `playlists:${id.value}`, "default");

const {
  filters,
  selectedRatings,
  selectedContentRatings,
  inLibrary,
  changed,
  reset: resetFilters,
} = useFilters();

const search = ref("");
const searchedTracks = useSearch(tracks, search, songSearchKeys);
const displayedTracks = computed(() => {
  const filteredTracks = filterResources<AmSong>(searchedTracks.value, filters.value);
  return sortSongs(filteredTracks, sortBy.value, direction.value);
});

const queueStore = useQueueStore();

function play(index = 0, shuffle = false) {
  if (!playlist.value || displayedTracks.value.length === 0) return;

  queueStore.playContext(
    { index, context: playlist.value, tracks: displayedTracks.value },
    shuffle,
  );
}

const menuItems = useResourceMenu(
  () =>
    playlist.value ? createListResource(playlist.value, `playlists:${id.value}`, 0) : undefined,
  { actions: { play: () => play(), shuffle: () => play(0, true) } },
);
</script>
