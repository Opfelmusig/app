<template>
  <OMTable>
    <template #header>
      <OMTableHeader class="w-12" />
      <OMTableHeader text="Title" />
      <OMTableHeader text="Artist" />
      <OMTableHeader text="Album" />
      <OMTableHeader text="Length" class="w-20" />
    </template>
    <template #default>
      <OMTableRow v-for="song in songs" :key="song.entry.id">
        <OMTableImg>
          <ArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :library-resource="song.resource"
            size="sm"
            color="muted"
          >
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon(song.resource.type)" :class="iconClass" />
          </ArtworkWrapper>
        </OMTableImg>
        <OMTableData :star="song.resource.item.personalRating === 1">
          <div class="flex items-center gap-2">
            <span class="truncate">
              {{ song.resource.item.name }}
            </span>
            <div
              v-if="song.resource.item.contentRating === 'explicit'"
              class="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-neutral-500 text-[9px] font-bold text-inverted"
            >
              E
            </div>
          </div>
        </OMTableData>
        <OMTableData class="text-muted">
          <LibraryLinks
            :links="song.resource.links"
            type="albums"
            :library-name="song.resource.item.albumName"
            :library-id="song.resource.item.albumId"
          />
        </OMTableData>
        <OMTableData class="text-muted">
          <LibraryLinks
            :links="song.resource.links"
            type="artists"
            :library-name="song.resource.item.artistName"
            :library-id="song.resource.item.artistId"
          />
        </OMTableData>
        <OMTableData class="text-muted tabular-nums">
          {{ msToHMS(song.resource.item.durationInMillis) }}
        </OMTableData>
      </OMTableRow>
    </template>
  </OMTable>
</template>

<script lang="ts" setup>
import type { ResolvedDbListResource, ResolvedDbSong } from "#layers/libcore/app/database/types";

defineProps<{
  songs?: ResolvedDbListResource<ResolvedDbSong>[];
}>();
</script>
