<template>
  <PageWrapper>
    <header class="flex gap-4 p-4">
      <AMArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :resource="playlist"
        color="muted"
        size="lg"
      >
        <MediaEditorialVideo
          :editorial-video="playlist?.attributes.editorialVideo"
          variant="square"
        >
          <template #fallback>
            <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon('playlists')" :class="iconClass" />
          </template>
        </MediaEditorialVideo>
      </AMArtworkWrapper>
      <div v-if="playlist" class="flex w-full flex-col justify-end gap-4">
        <div class="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
          <h2>{{ playlist.attributes.name }}</h2>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span v-if="playlist.attributes.curatorName" class="truncate">
              <NuxtLink
                v-if="playlist.attributes.curatorSocialHandle"
                :to="`/profile/${playlist.attributes.curatorSocialHandle}`"
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
          <OMButtonPlay />
          <OMButtonSecondary icon="lucide:shuffle" />
          <OMButtonSecondary
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
          <AMControlsFilters :active="changed" @click="resetFilters">
            <AMControlsFiltersItem
              v-model="selectedRatings"
              label="Rating"
              :items="songRatingFilter"
            />
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
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </div>
    </header>
    <AMSongs :songs="displayedTracks" :columns />
    <AMFooter>
      <span>
        <AMFooterCount :count="displayedTracks?.length ?? 0" singular="song" />,
        <span>
          {{ tracksDuration(displayedTracks) }}
        </span>
      </span>

      <AMFooterLink :resource="playlist" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/columns";
import { songContentRatingFilter, songRatingFilter } from "#layers/amdata/app/lib/filters";
import { defaultSongSorting } from "#layers/amdata/app/lib/sorting";
import type { SongSort } from "#layers/amdata/app/types/songs";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

const id = useRouteParams<string>("id");

const library = useLibrary();
const { data: playlist } = useLibraryQuery({
  key: () => ["playlist", id.value],
  query: () => library.client.getPlaylist(id.value),
});
const { data: tracks } = useLibraryList(() => playlistTracksListId(id.value));

const { columns, reset, columnsChanged } = useColumns(
  () => playlistTracksListId(toValue(id)),
  defaultSongColumns,
);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<SongSort>(() => playlistTracksListId(toValue(id)), "default");

const {
  filters,
  selectedRatings,
  selectedContentRatings,
  isUploaded,
  changed,
  reset: resetFilters,
} = useSongFilters();

const displayedTracks = computed(() => {
  const filteredSongs = filterSongs(tracks.value ?? [], filters.value);

  return sortSongs(filteredSongs, sortBy.value, direction.value);
});

const { mutate: refreshPlaylist } = useMutation({
  mutation: (playlistId: string) => library.refreshPlaylist(playlistId),
});

watch(
  [id, () => library.state.ready],
  ([playlistId, ready]) => {
    if (ready && playlistId) {
      refreshPlaylist(playlistId);
    }
  },
  { immediate: true },
);
</script>
