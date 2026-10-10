<template>
  <OMTableRow>
    <OMTableSimple>
      <AMArtworkWrapper
        v-slot="{ iconClass }"
        :resource="song"
        size="sm"
        :color="albumMode ? undefined : 'muted'"
      >
        <div v-if="albumMode" class="flex size-full items-center justify-center text-muted">
          <span class="truncate text-center tabular-nums group-hover:opacity-0">
            {{ song.resource.attributes.trackNumber }}
          </span>
        </div>
        <template v-else>
          <AMArtworkImage />
          <AMArtworkPlaceholder />
        </template>
        <AMArtworkOverlay :transparent="albumMode">
          <OMIcon name="lucide:play" :class="iconClass" filled />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
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
          <OMDownloaded v-if="song.resourceType === 'songs' && song.resource.extras.libraryId" />
        </div>
      </div>
    </OMTableData>
    <OMTableData v-if="columns.includes('album')" class="text-muted">
      <AMLinks
        :links="song.resource.attributes.albums"
        type="albums"
        :fallback-name="song.resource.attributes.albumName"
        :fallback-id="
          song.resourceType === 'library-songs' ? song.resource.extras.albumId : undefined
        "
      />
    </OMTableData>
    <OMTableData v-if="columns.includes('artist')" class="text-muted">
      <AMLinks
        :links="song.resource.attributes.artists"
        type="artists"
        :fallback-name="song.resource.attributes.artistName"
        :fallback-id="
          song.resourceType === 'library-songs' ? song.resource.extras.artistId : undefined
        "
      />
    </OMTableData>
    <OMTableData v-if="columns.includes('genre')" class="text-muted">
      {{ song.resource.attributes.genreNames.join(", ") }}
    </OMTableData>
    <OMTableData v-if="columns.includes('year')" class="text-muted tabular-nums">
      <NuxtTime
        v-if="song.resource.attributes.releaseDate"
        :datetime="song.resource.attributes.releaseDate"
        year="numeric"
      />
    </OMTableData>
    <OMTableData v-if="columns.includes('length')" class="text-end text-muted tabular-nums">
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
import type { AmSong } from "#layers/amdata/app/types/songs";

defineProps<{
  song: AmListResource<AmSong>;
  albumMode?: boolean;
}>();

const columns = useTableColumns();
</script>
