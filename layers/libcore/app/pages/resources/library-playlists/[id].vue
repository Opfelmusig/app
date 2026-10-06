<template>
  <PageWrapper>
    <header class="flex gap-4 p-4">
      <ArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :library-resource="playlist"
        color="muted"
        size="lg"
      >
        <MediaEditorialVideo
          :editorial-video="playlist?.attributes.editorialVideo"
          variant="square"
        >
          <template #fallback>
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon('playlists')" :class="iconClass" />
          </template>
        </MediaEditorialVideo>
      </ArtworkWrapper>
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
          <OMButtonSecondary icon="lucide:arrow-up-down" />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonSecondary fill icon="lucide:columns-3" />
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </div>
    </header>
    <LibrarySongs :songs="tracks" />
    <LibraryFooter>
      <span>
        <span>{{ tracks?.length ?? 0 }} {{ tracks?.length === 1 ? "song" : "songs" }}, </span>
        <span>
          {{ libraryTracksDuration(tracks) }}
        </span>
      </span>

      <LibraryFooterLink :resource="playlist" />
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
const library = useLibrary();
const id = useRouteParams<string>("id");

const { data: playlist } = useLibraryPlaylist(id);
const { data: tracks } = useLibraryPlaylistTracks(id);

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
