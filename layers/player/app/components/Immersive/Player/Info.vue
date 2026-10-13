<template>
  <OMScrollingTextGroup v-if="resource" class="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
    <OMScrollingText class="text-xl">
      <div class="flex items-center gap-2">
        <span>{{ resource.attributes.name }}</span>
        <OMStar v-if="resource.attributes.personalRating === 1" large />
      </div>
    </OMScrollingText>
    <OMScrollingText
      v-if="
        resource.attributes.artists.length ||
        resource.attributes.artistName ||
        resource.attributes.albums.length ||
        resource.attributes.albumName
      "
      class="text-muted"
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
const queueStore = useQueueStore();

const resource = computed(() => queueStore.current?.entry.resource);
</script>
