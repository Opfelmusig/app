<template>
  <PageWrapper>
    <div class="flex gap-4 p-4">
      <ArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :library-resource="playlist"
        color="muted"
        size="lg"
      >
        <MediaEditorialVideo :editorial-video="playlist?.item.editorialVideo" variant="square">
          <template #fallback>
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon('playlists')" :class="iconClass" />
          </template>
        </MediaEditorialVideo>
      </ArtworkWrapper>
      <div v-if="playlist" class="flex w-full flex-col justify-end gap-4">
        <div class="flex w-full min-w-0 flex-col gap-1 whitespace-nowrap">
          <h2>{{ playlist.item.name }}</h2>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span v-if="playlist.item.curatorName" class="truncate">
              <NuxtLink
                v-if="playlist.item.curatorSocialHandle"
                :to="`/profile/${playlist.item.curatorSocialHandle}`"
                class="hover:underline"
              >
                {{ playlist.item.curatorName }}
              </NuxtLink>
              <span v-else>
                {{ playlist.item.curatorName }}
              </span>
            </span>
            <div
              v-if="playlist.item.curatorName"
              class="size-1 shrink-0 rounded-full bg-accented"
            />
            <span v-if="playlist.item.lastModifiedDate" class="truncate">
              Updated
              <NuxtTime
                :datetime="playlist.item.lastModifiedDate"
                date-style="medium"
                time-style="medium"
                relative
              />
            </span>
          </div>
          <p
            v-if="playlist?.item.description"
            class="line-clamp-2 text-sm whitespace-break-spaces text-dimmed"
          >
            {{ playlist.item.description }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <OMButtonPlay />
          <OMButtonSecondary icon="lucide:shuffle" />
          <OMButtonSecondary fill icon="lucide:star" :active="playlist.item.personalRating === 1" />
          <OMButtonSeparator />
          <OMButtonSecondary icon="lucide:arrow-up-down" />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonSecondary fill icon="lucide:columns-3" />
          <UInput
            variant="soft"
            color="neutral"
            icon="lucide:search"
            placeholder="Search..."
            class="shrink-0"
            :ui="{ base: 'h-9 rounded-xl' }"
          />
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </div>
    </div>
    <LibrarySongs :songs="tracks" />
    <div class="flex justify-between gap-2 p-4 text-sm text-muted">
      <span>
        <span>{{ tracks?.length ?? 0 }} songs, </span>
        <span>
          {{
            ms(libraryTracksDuration(tracks?.map((track) => track.resource.item)), {
              long: true,
            })
          }}
        </span>
      </span>
      <NuxtLink
        v-if="playlist?.item.catalogId"
        :to="`/resources/playlists/${playlist.item.catalogId}`"
        class="flex items-center gap-1 hover:underline"
      >
        <span>Open Catalog</span>
        <UIcon name="lucide:arrow-up-right" class="size-3 text-dimmed" />
      </NuxtLink>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const id = useRouteParams<string>("id");

const { data: playlist } = useLibraryPlaylist(id);
const { data: tracks } = useLibraryPlaylistTracks(id);
</script>
