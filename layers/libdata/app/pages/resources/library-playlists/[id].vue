<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <UChip
        position="bottom-right"
        :ui="{ base: 'size-6 ring-3' }"
        class="shrink-0 self-start"
        inset
        color="neutral"
        :show="!!playlist"
      >
        <template #content>
          <UTooltip
            :text="playlist?.extras.isPublic ? 'Public playlist' : 'Private playlist'"
            arrow
          >
            <UIcon
              :name="playlist?.extras.isPublic ? 'lucide:globe' : 'lucide:lock-keyhole'"
              class="size-3.5 [&>g]:stroke-3"
              mode="svg"
            />
          </UTooltip>
        </template>
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
      </UChip>
      <div class="flex w-full min-w-0 flex-col justify-end gap-4">
        <div v-if="playlist" class="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
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
          <AMFavoriteButton v-if="playlist" :resource="playlist" />
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
        <AMSongsItem
          v-for="(song, index) in displayedTracks"
          :key="`${song.id}:${index}`"
          :song
          :extra-menu-items="songMenuItems(song)"
          @play="play(index)"
        />
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
import type { DropdownMenuItem } from "@nuxt/ui";

import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/controls/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/controls/filters";
import { defaultSongSorting } from "#layers/amdata/app/lib/controls/sorting";
import { fetchLibraryPlaylist } from "#layers/libdata/app/lib/queries/playlists";

const id = useRouteParams<string>("id");

const {
  data: playlist,
  isPending,
  error,
} = useLibraryQuery({
  key: () => ["playlists", "resource", id.value],
  query: () => fetchLibraryPlaylist(id.value),
  staleTime: ms("3h"),
});
const {
  data: tracks,
  isPending: tracksPending,
  isLoading: tracksLoading,
  error: tracksError,
} = useLibraryPlaylistTracks(id);

const mutations = useMutations();
const { mutate: removeTrack, isLoading: removingTrack } = useMutation({
  mutation: (input: { playlistId: string; songId: string }) =>
    mutations.removePlaylistTrack(input.playlistId, input.songId),
});

function songMenuItems(song: AmSong): DropdownMenuItem[] {
  if (!playlist.value?.extras.canEdit) return [];

  return [
    {
      label: "Remove from playlist",
      color: "error",
      disabled: removingTrack.value || tracksLoading.value || !!tracksError.value,
      onSelect: () => {
        if (
          removingTrack.value ||
          tracksLoading.value ||
          tracksError.value ||
          song.type !== "library-songs"
        )
          return;
        if (!tracks.value?.includes(song) || playlist.value?.id !== id.value) return;

        removeTrack({ playlistId: id.value, songId: song.id });
      },
    },
  ];
}

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

const menuItems = useResourceMenu(() => playlist.value, {
  actions: { play: () => play(), shuffle: () => play(0, true) },
});
</script>
