<template>
  <OMTableRow>
    <OMTableData v-if="albumMode">
      <div class="flex justify-center text-muted">
        <span class="truncate text-center tabular-nums">
          {{ song.resource.attributes.trackNumber }}
        </span>
      </div>
    </OMTableData>
    <OMTableSimple v-else>
      <ArtworkWrapper
        v-slot="{ iconClass, imageSize, artwork }"
        :resource="song.resource"
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
        <div class="ml-auto flex gap-2">
          <OMExplicit v-if="song.resource.attributes.contentRating === 'explicit'" />
          <OMDownloaded v-if="song.resource.type === 'songs' && song.resource.extras.libraryId" />
        </div>
      </div>
    </OMTableData>
    <OMTableData v-if="columns?.includes('album')" class="text-muted">
      <AMLinks
        :links="song.resource.attributes.albums"
        type="albums"
        :fallback-name="song.resource.attributes.albumName"
        :fallback-id="
          song.resource.type === 'library-songs' ? song.resource.extras.albumId : undefined
        "
      />
    </OMTableData>
    <OMTableData v-if="columns?.includes('artist')" class="text-muted">
      <AMLinks
        :links="song.resource.attributes.artists"
        type="artists"
        :fallback-name="song.resource.attributes.artistName"
        :fallback-id="
          song.resource.type === 'library-songs' ? song.resource.extras.artistId : undefined
        "
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

<script lang="ts" setup>
import { AMLinks } from "#components";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  song: AmListResource<AmSong>;
  columns?: SongColumns[];
  albumMode?: boolean;
}>();
</script>
