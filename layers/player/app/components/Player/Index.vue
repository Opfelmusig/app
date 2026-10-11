<template>
  <div
    class="relative flex h-14.25 w-full shrink-0 items-center gap-2 overflow-hidden border-t border-default bg-muted/20 p-2 whitespace-nowrap select-none"
  >
    <div
      class="flex w-full min-w-0 items-center gap-2"
      :style="{ maxWidth: `${width ? width - 16 : 244}px` }"
    >
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
    <div class="mr-4 flex min-w-100 flex-1 shrink-0 items-center gap-4 overflow-hidden">
      <div class="flex shrink-0 items-center gap-1">
        <div class="mr-1 h-8 w-px shrink-0 grow-0 rounded-full bg-border" />
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="queueStore.isShuffeling = !queueStore.isShuffeling"
        >
          <UIcon
            mode="svg"
            name="lucide:shuffle"
            class="size-4"
            :class="queueStore.isShuffeling ? 'text-primary' : 'text-muted'"
          />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="queueStore.previous"
        >
          <OMIcon mode="svg" name="lucide:skip-back" class="size-4 text-muted" filled />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
        >
          <OMIcon name="lucide:play" filled class="size-4 text-muted" />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="queueStore.next"
        >
          <OMIcon mode="svg" name="lucide:skip-forward" class="size-4 text-muted" filled />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="queueStore.isLooping = !queueStore.isLooping"
        >
          <UIcon
            mode="svg"
            name="lucide:repeat"
            class="size-4"
            :class="queueStore.isLooping ? 'text-primary' : 'text-muted'"
          />
        </div>
      </div>
      <div class="flex w-full items-center gap-4 text-xs text-muted tabular-nums">
        <span>{{ msToHMS(0 * 1000) }}</span>
        <USlider :step="0.01" :disabled="!resource" class="w-full py-2" />
        <span>{{ msToHMS(resource?.attributes.durationInMillis ?? 0 * 1000) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();

const resource = computed(() => queueStore.current?.entry.resource);

const { width } = useSidebar();
</script>
