<template>
  <OMTableRow :reorder-id @dblclick="$emit('play')">
    <OMTableSimple>
      <AMArtworkWrapper
        v-slot="{ iconClass }"
        :resource="song"
        context="list"
        :transparent="albumMode"
      >
        <div
          v-if="albumMode && !isActive"
          class="flex size-full items-center justify-center text-muted"
        >
          <span class="truncate text-center tabular-nums group-hover:opacity-0">
            {{ song.resource.attributes.trackNumber }}
          </span>
        </div>
        <div
          v-else-if="albumMode"
          class="absolute inset-0 flex items-center justify-center bg-muted/50"
        >
          <OMIcon
            v-if="playbackStore.pending"
            name="lucide:loader-circle"
            class="size-4 animate-spin text-highlighted [&>path]:stroke-3"
          />
          <OMVisualizer v-else />
        </div>
        <template v-else>
          <AMArtworkImage />
          <div
            v-if="isActive"
            class="absolute inset-0 flex items-center justify-center bg-muted/50"
          >
            <OMIcon
              v-if="playbackStore.pending"
              name="lucide:loader-circle"
              class="size-4 animate-spin text-highlighted [&>path]:stroke-3"
            />
            <OMVisualizer v-else />
          </div>
          <AMArtworkPlaceholder />
        </template>
        <AMArtworkOverlay v-if="!isActive" :transparent="albumMode" @click="$emit('play')">
          <OMIcon name="lucide:play" :class="iconClass" filled />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </OMTableSimple>
    <OMTableData>
      <div class="flex items-center gap-2">
        <span class="truncate">
          {{ song.resource.attributes.name }}
        </span>
        <OMStar v-if="song.resource.attributes.personalRating === 1" />
        <div class="ml-auto flex gap-2 empty:hidden">
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
      <OMButtonTertiary icon="lucide:ellipsis" class="text-muted" />
    </OMTableSimple>
  </OMTableRow>
</template>

<script lang="ts" setup>
const props = defineProps<{
  song: AmListResource<AmSong>;
  albumMode?: boolean;
  reorderId?: string;
}>();

const columns = useTableColumns();

defineEmits<{
  (e: "play"): void;
}>();

const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();

const isActive = computed(() => queueStore.current?.entry.key === props.song.key);
</script>
