<template>
  <div
    ref="scroller"
    class="relative flex size-full min-w-0 flex-col overflow-hidden overflow-y-auto"
    :style
  >
    <div class="flex gap-4 p-4">
      <ArtworkWrapper
        v-slot="{ artwork, iconClass, imageSize }"
        :library-resource="playlist"
        color="muted"
        size="lg"
      >
        <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
        <UIcon v-else :name="resourceIcon('playlists')" :class="iconClass" />
      </ArtworkWrapper>
      <div v-if="playlist" class="flex flex-col justify-end gap-4">
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
            <div v-if="playlist.item.curatorName" class="size-1 shrink-0 bg-accented" />
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
          <OMButtonSeparator />
          <OMButtonSecondary icon="lucide:arrow-up-down" />
          <OMButtonStar :starred="playlist.item.personalRating === 1" />
          <OMButtonTeritary icon="lucide:ellipsis" />
        </div>
      </div>
    </div>
    <OMTable>
      <template #header>
        <OMTableHeader class="w-12" />
        <OMTableHeader text="Title" />
        <OMTableHeader text="Artist" />
        <OMTableHeader text="Album" />
        <OMTableHeader text="Length" class="w-20" />
      </template>
      <template #default>
        <OMTableRow v-for="track in tracks" :key="track.entry.id">
          <OMTableImg>
            <ArtworkWrapper
              v-slot="{ iconClass, imageSize, artwork }"
              :library-resource="track.resource"
              size="sm"
              color="muted"
            >
              <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
              <UIcon v-else :name="resourceIcon(track.resource.type)" :class="iconClass" />
            </ArtworkWrapper>
          </OMTableImg>
          <OMTableData :star="track.resource.item.personalRating === 1">
            {{ track.resource.item.name }}
          </OMTableData>
          <OMTableData class="text-muted">
            {{ track.resource.item.albumName }}
          </OMTableData>
          <OMTableData class="text-muted">
            {{ track.resource.item.artistName }}
          </OMTableData>
          <OMTableData class="text-muted tabular-nums">
            {{ msToHMS(track.resource.item.durationInMillis) }}
          </OMTableData>
        </OMTableRow>
      </template>
    </OMTable>
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
  </div>
</template>

<script lang="ts" setup>
const id = useRouteParams<string>("id");

const { data: playlist } = useLibraryPlaylist(id);
const { data: tracks } = useLibraryPlaylistTracks(id);

const scroller = useTemplateRef("scroller");
const { style } = useCustomScrollShadow(scroller, {
  sizeStart: 0,
});
</script>
