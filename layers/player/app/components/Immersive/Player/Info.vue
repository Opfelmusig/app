<template>
  <OMScrollingTextGroup
    v-if="resource"
    :key="expanded ? 'expanded' : 'collapsed'"
    class="flex w-full min-w-0 flex-1 flex-col overflow-hidden"
    :class="!expanded ? 'pointer-events-none' : ''"
  >
    <div class="flex items-center justify-between gap-2">
      <OMScrollingText
        class="transition-[font-size,line-height] duration-150 ease-out"
        :class="expanded ? 'text-xl' : 'text-sm'"
      >
        <div class="flex items-center gap-2">
          <span>{{ resource.attributes.name }}</span>
          <OMStar v-if="resource.attributes.personalRating === 1" :large="expanded" />
        </div>
      </OMScrollingText>
      <UIcon
        v-if="!expanded && playbackStore.loading"
        name="lucide:loader-circle"
        class="size-4 animate-spin text-muted"
      />
    </div>
    <OMScrollingText
      v-if="
        resource.attributes.artists.length ||
        resource.attributes.artistName ||
        resource.attributes.albums.length ||
        resource.attributes.albumName
      "
      class="text-muted transition-opacity duration-150 ease-out"
      :class="expanded ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <span class="flex w-max items-center gap-1.5 whitespace-nowrap">
        <AMLinks
          v-if="resource.attributes.artists.length"
          :links="resource.attributes.artists"
          type="artists"
        />
        <span v-else-if="resource.attributes.artistName">
          {{ resource.attributes.artistName }}
        </span>
        <span
          v-if="
            (resource.attributes.artists.length || resource.attributes.artistName) &&
            (resource.attributes.albums.length || resource.attributes.albumName)
          "
          class="size-1 min-w-1 shrink-0 rounded-full bg-white/20"
        />
        <AMLinks
          v-if="resource.attributes.albums.length"
          :links="resource.attributes.albums"
          type="albums"
        />
        <span v-else-if="resource.attributes.albumName">
          {{ resource.attributes.albumName }}
        </span>
      </span>
    </OMScrollingText>
  </OMScrollingTextGroup>
</template>

<script lang="ts" setup>
defineProps<{
  expanded: boolean;
}>();

const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();

const resource = computed(() => queueStore.current?.entry.resource);
</script>
