<template>
  <PageWrapper>
    <header class="flex gap-4 p-4">
      <ArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :resource="album"
        color="muted"
        size="lg"
      >
        <MediaEditorialVideo :editorial-video="album?.attributes.editorialVideo" variant="square">
          <template #fallback>
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon('playlists')" :class="iconClass" />
          </template>
        </MediaEditorialVideo>
      </ArtworkWrapper>
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
            <span class="truncate">
              Released
              <AMReleaseDate
                v-if="album.attributes.releaseDate"
                :release-date="album.attributes.releaseDate"
                date-style="long"
              />
            </span>
            <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
            <span class="truncate">
              {{ album.attributes.genreNames.join(", ") }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <OMButtonPlay />
          <OMButtonSecondary icon="lucide:shuffle" />
          <OMButtonSecondary
            fill
            icon="lucide:star"
            :active="album.attributes.personalRating === 1"
          />
          <OMButtonSeparator />
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="defaultSongSorting"
            :active="sortChanged"
            @reset="resetSorting"
          />
          <OMButtonSecondary fill icon="lucide:filter" />
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
    <LibraryFooter>
      <span>
        <span>
          {{ displayedTracks?.length ?? 0 }}
          {{ displayedTracks?.length === 1 ? "song" : "songs" }},
        </span>
        <span>
          {{ tracksDuration(displayedTracks) }}
        </span>
      </span>

      <LibraryFooterLink :resource="album" />
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { AMLinks, AMReleaseDate } from "#components";
import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/columns";
import { defaultSongSorting } from "#layers/amdata/app/lib/sorting";
import type { SongSort } from "#layers/amdata/app/types/songs";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

const library = useLibrary();
const id = useRouteParams<string>("id");

const { data: album } = useLibraryAlbum(id);
const { data: tracks } = useLibraryAlbumTracks(id);

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

const displayedTracks = computed(() => {
  return sortSongs(tracks.value ?? [], sortBy.value, direction.value);
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
