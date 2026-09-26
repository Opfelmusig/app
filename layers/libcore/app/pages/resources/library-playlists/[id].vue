<template>
  <div ref="scroller" class="flex size-full flex-col overflow-auto" :style>
    <div class="flex gap-4 p-6">
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
          <PlaybackButtonPlay />
          <PlaybackButtonSecondary icon="lucide:shuffle" />
          <PlaybackButtonSeparator />
          <PlaybackButtonSecondary icon="lucide:arrow-up-down" />
          <PlaybackButtonStar :starred="playlist.item.personalRating === 1" />
          <PlaybackButtonTeritary icon="lucide:ellipsis" />
        </div>
      </div>
    </div>
    <div v-if="tracks" class="flex w-full flex-col gap-4 border-y border-default p-6">
      <div v-for="song in tracks" :key="song.resource.item.id" class="flex items-center gap-2">
        <img
          v-if="song.resource.item.artwork"
          :src="getArtworkUrl(song.resource.item.artwork, { width: 128 })"
          class="size-12 rounded-lg"
        />
        <div v-else class="size-12 rounded-lg bg-muted" />
        <div class="flex min-w-0 flex-col whitespace-nowrap">
          <span class="truncate">{{ song.resource.item.name }}</span>
          <span class="truncate text-sm text-muted">
            {{ song.resource.item.albumName }} - {{ song.resource.item.artistName }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex justify-between gap-2 p-6 text-sm text-muted">
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
import { getArtworkUrl } from "@opfelmusig/lib/helpers";
import ms from "ms";

const id = useRouteParams<string>("id");

const { data: playlist } = useLibraryPlaylist(id);
const { data: tracks } = useLibraryPlaylistTracks(id);

const scroller = useTemplateRef("scroller");
const { style } = useCustomScrollShadow(scroller);
</script>
