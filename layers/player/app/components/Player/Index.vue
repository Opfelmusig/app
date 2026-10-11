<template>
  <div
    class="relative flex h-14.25 w-full shrink-0 items-center gap-2 overflow-hidden border-t border-default bg-muted/20 p-2 whitespace-nowrap select-none"
  >
    <div class="flex w-full max-w-60.75 min-w-0 items-center gap-2">
      <AMArtworkWrapper v-slot="{ iconClass }" :resource context="player" color="muted">
        <AMArtworkImage />
        <AMArtworkPlaceholder />
        <AMArtworkOverlay>
          <OMIcon name="lucide:ellipsis" :class="iconClass" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
      <OMScrollingTextGroup class="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
        <OMScrollingText class="text-sm">
          <div class="flex items-center gap-2">
            <span>{{ resource?.attributes.name ?? "-" }}</span>
            <ResourceStar v-if="resource?.attributes.personalRating === 1" class="mb-1 size-2.5" />
          </div>
        </OMScrollingText>
        <OMScrollingText class="text-xs text-muted">
          <span class="flex w-max items-center gap-1.5 whitespace-nowrap">
            <AMLinks
              v-if="resource?.attributes.artists.length"
              :links="resource?.attributes.artists"
              type="artists"
            />
            <span v-else-if="resource?.attributes.artistName">
              {{ resource?.attributes.artistName }}
            </span>
            <span
              v-if="
                (resource?.attributes.artists.length || resource?.attributes.artistName) &&
                (resource?.attributes.albums.length || resource?.attributes.albumName)
              "
              class="size-1 min-w-1 shrink-0 rounded-full bg-white/20"
            />
            <AMLinks
              v-if="resource?.attributes.albums.length"
              :links="resource?.attributes.albums"
              type="albums"
            />
            <span v-else-if="resource?.attributes.albumName">
              {{ resource?.attributes.albumName }}
            </span>
            <span
              v-if="
                !resource?.attributes.artists.length &&
                !resource?.attributes.artistName &&
                !resource?.attributes.albums.length &&
                !resource?.attributes.albumName
              "
            >
              -
            </span>
          </span>
        </OMScrollingText>
      </OMScrollingTextGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();

const resource = computed(() => queueStore.current?.entry.resource);
</script>
