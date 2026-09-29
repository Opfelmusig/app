<template>
  <OMTable>
    <template #header>
      <OMTableHeader class="w-12" />
      <OMTableHeader text="Title" />
      <OMTableHeader text="Album" />
      <OMTableHeader text="Artist" />
      <OMTableHeader text="Length" class="w-20 text-end" />
      <OMTableHeader class="w-13" />
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
        <OMTableData>
          <div class="flex items-center gap-2">
            <span class="truncate">
              {{ song.resource.item.name }}
            </span>
            <OMIcon
              v-if="song.resource.item.personalRating === 1"
              name="lucide:star"
              filled
              class="size-3 shrink-0 text-primary"
            />
            <OMExplicit v-if="song.resource.item.contentRating === 'explicit'" class="ml-auto">
              E
            </OMExplicit>
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
        <OMTableData class="text-end text-muted tabular-nums">
          {{ msToHMS(song.resource.item.durationInMillis) }}
        </OMTableData>
        <OMTableData class="no-active">
          <OMButtonTeritary icon="lucide:ellipsis" class="text-muted" />
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
