<template>
  <OMTable>
    <template #header>
      <OMTableHeader class="w-12" />
      <OMTableHeader text="Title" />
      <OMTableHeader v-if="columns?.includes('album')" text="Album" />
      <OMTableHeader v-if="columns?.includes('artist')" text="Artist" />
      <OMTableHeader v-if="columns?.includes('genre')" text="Genre" class="w-[15%]" />
      <OMTableHeader v-if="columns?.includes('year')" text="Year" class="w-14" />
      <OMTableHeader v-if="columns?.includes('length')" text="Length" class="w-20 text-end" />
      <OMTableHeader class="w-12" />
    </template>
    <template #default>
      <OMTableRow v-for="song in songs" :key="song.entry.id">
        <OMTableSimple>
          <ArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :library-resource="song.resource"
            size="sm"
            color="muted"
          >
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon(song.resource.type)" :class="iconClass" />
          </ArtworkWrapper>
        </OMTableSimple>
        <OMTableData>
          <div class="flex items-center gap-2">
            <span class="truncate">
              {{ song.resource.attributes.name }}
            </span>
            <OMIcon
              v-if="song.resource.attributes.personalRating === 1"
              name="lucide:star"
              filled
              class="size-3 shrink-0 text-primary"
            />
            <OMExplicit
              v-if="song.resource.attributes.contentRating === 'explicit'"
              class="ml-auto"
            >
              E
            </OMExplicit>
          </div>
        </OMTableData>
        <OMTableData v-if="columns?.includes('album')" class="text-muted">
          <LibraryLinks
            :links="song.resource.attributes.albums"
            type="albums"
            :library-name="song.resource.attributes.albumName"
            :library-id="song.resource.extras.albumId"
          />
        </OMTableData>
        <OMTableData v-if="columns?.includes('artist')" class="text-muted">
          <LibraryLinks
            :links="song.resource.attributes.artists"
            type="artists"
            :library-name="song.resource.attributes.artistName"
            :library-id="song.resource.extras.artistId"
          />
        </OMTableData>
        <OMTableData v-if="columns?.includes('genre')" class="text-muted">
          {{ song.resource.attributes.genreNames.join(", ") }}
        </OMTableData>
        <OMTableData v-if="columns?.includes('year')" class="text-muted tabular-nums">
          <NuxtTime
            v-if="song.resource.attributes.releaseDate"
            :datetime="song.resource.attributes.releaseDate"
            year="numeric"
          />
        </OMTableData>
        <OMTableData v-if="columns?.includes('length')" class="text-end text-muted tabular-nums">
          {{ msToHMS(song.resource.attributes.durationInMillis) }}
        </OMTableData>
        <OMTableSimple class="pl-1">
          <OMButtonTeritary icon="lucide:ellipsis" class="text-muted" />
        </OMTableSimple>
      </OMTableRow>
    </template>
  </OMTable>
</template>

<script lang="ts" setup>
import type { AmLibrarySong } from "#layers/amdata/app/types/songs";
import type { ResolvedDbListResource } from "#layers/libcore/app/database/types";

export type SongColumns = "album" | "artist" | "genre" | "year" | "length";

defineProps<{
  songs?: ResolvedDbListResource<AmLibrarySong>[];
  columns?: SongColumns[];
}>();
</script>
