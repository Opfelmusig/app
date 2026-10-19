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
      <div v-if="playlist" class="flex w-full flex-col justify-end gap-4">
        <div class="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
          <h2>{{ playlist.attributes.name }}</h2>
          <div class="flex items-center gap-2 text-sm whitespace-nowrap text-muted">
            <span v-if="playlist.attributes.curatorName" class="truncate">
              <NuxtLink
                v-if="playlist.attributes.curatorSocialHandle"
                :to="rawResourceLink('social-profiles', playlist.attributes.curatorSocialHandle)"
                class="hover:underline"
              >
                {{ playlist.attributes.curatorName }}
              </NuxtLink>
              <span v-else>
                {{ playlist.attributes.curatorName }}
              </span>
            </span>
            <div
              v-if="playlist.attributes.curatorName"
              class="size-1 shrink-0 rounded-full bg-accented"
            />
            <UTooltip
              v-if="playlist.attributes.lastModifiedDate"
              :text="playlist.attributes.lastModifiedDate.toLocaleString()"
              arrow
            >
              <span class="truncate">
                Updated
                <NuxtTime
                  :datetime="playlist.attributes.lastModifiedDate"
                  date-style="medium"
                  time-style="medium"
                  relative
                />
              </span>
            </UTooltip>
          </div>
          <p
            v-if="playlist?.attributes.description"
            class="line-clamp-2 text-sm whitespace-break-spaces text-dimmed"
          >
            {{ playlist.attributes.description }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <OMButtonPlay @click="play" />
          <OMButtonSecondary icon="lucide:shuffle" @click="play(0, true)" />
          <OMButtonSecondary
            fill
            icon="lucide:star"
            :active="playlist.attributes.personalRating === 1"
          />
          <UTooltip :text="playlist.extras.isPublic ? 'Public playlist' : 'Private playlist'" arrow>
            <OMButtonSecondary
              :icon="playlist.extras.isPublic ? 'lucide:globe' : 'lucide:globe-lock'"
              :active="playlist.extras.isPublic"
            />
          </UTooltip>
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
    <AMFooter>
      <span>
        <AMFooterCount :count="displayedTracks?.length" singular="song" />,
        <span>
          {{ tracksDuration(displayedTracks) }}
        </span>
      </span>

      <AMFooterLink :resource="playlist ?? undefined" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/controls/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/controls/filters";
import { defaultSongSorting } from "#layers/amdata/app/lib/controls/sorting";
import {
  fetchLibraryPlaylist,
  fetchLibraryPlaylistTracks,
} from "#layers/amdata/app/lib/queries/playlists";

const id = useRouteParams<string>("id");

const { data: playlist } = useAmQuery({
  scope: "library",
  key: () => ["playlists", id.value, "resource"],
  query: () => fetchLibraryPlaylist(id.value),
  staleTime: ms("6h"),
  gcTime: false,
});
const {
  data: tracks,
  isPending: tracksPending,
  error: tracksError,
} = useAmQuery({
  scope: "library",
  key: () => ["playlists", id.value, "tracks"],
  query: () => fetchLibraryPlaylistTracks(id.value),
  staleTime: ms("6h"),
  gcTime: false,
});

const { columns, reset, columnsChanged } = useColumns(id, defaultSongColumns);

const { sortBy, direction, sortChanged, reset: resetSorting } = useSorting<SongSort>(id, "default");

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
  if (!playlist.value || displayedTracks.value.length === 0) return;

  queueStore.playContext(
    {
      index,
      context: playlist.value,
      tracks: displayedTracks.value,
    },
    shuffle,
  );
}

const menuItems = useResourceMenu(
  () => (playlist.value ? createListResource(playlist.value, id.value, 0) : undefined),
  { actions: { play: () => play(), shuffle: () => play(0, true) } },
);
</script>
