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
      <template v-if="resource">
        <OMScrollingTextGroup class="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
          <OMScrollingText class="text-sm">
            <div class="flex items-center gap-2">
              <span>{{ resource.attributes.name }}</span>
              <ResourceStar v-if="resource.attributes.personalRating === 1" class="mb-1 size-2.5" />
            </div>
          </OMScrollingText>
          <OMScrollingText
            v-if="
              resource.attributes.artists.length ||
              resource.attributes.artistName ||
              resource.attributes.albums.length ||
              resource.attributes.albumName
            "
            class="text-xs text-muted"
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
    </div>
    <div class="mr-4 flex min-w-100 flex-1 shrink-0 items-center gap-4 overflow-hidden">
      <div class="flex shrink-0 items-center gap-1">
        <div class="mr-1 h-8 w-px shrink-0 grow-0 rounded-full bg-border" />
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="queueStore.toggleShuffle"
        >
          <UIcon
            mode="svg"
            name="lucide:shuffle"
            class="size-4"
            :class="queueStore.isShuffling ? 'text-primary' : 'text-muted'"
          />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="playbackStore.previous"
        >
          <OMIcon mode="svg" name="lucide:skip-back" class="size-4 text-muted" filled />
        </div>
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:bg-muted active:scale-95"
          @click="playbackStore.toggle"
          @keydown.enter="playbackStore.toggle"
          @keydown.space.prevent="playbackStore.toggle"
        >
          <OMIcon
            :name="
              playbackStore.pending
                ? 'lucide:loader-circle'
                : playbackStore.paused
                  ? 'lucide:play'
                  : 'lucide:pause'
            "
            :filled="!playbackStore.pending"
            :class="playbackStore.pending ? 'size-4 animate-spin text-muted' : 'size-4 text-muted'"
          />
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
        <span>{{ msToHMS((seekPosition ?? playbackStore.position) * 1000) }}</span>
        <USlider
          :model-value="seekPosition ?? playbackStore.position"
          :min="0"
          :max="playbackStore.duration || 1"
          :step="0.1"
          :disabled="!resource || !playbackStore.duration"
          class="w-full py-2"
          @update:model-value="seekPosition = $event ?? null"
          @change="commitSeek"
        />
        <span>{{ msToHMS(playbackStore.duration * 1000) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
const seekPosition = ref<number | null>(null);

function commitSeek() {
  if (seekPosition.value !== null) playbackStore.seek(seekPosition.value);
  seekPosition.value = null;
}

watch(
  () => queueStore.current?.id,
  () => {
    seekPosition.value = null;
  },
);

const resource = computed(() => queueStore.current?.entry.resource);

const { width } = useSidebar();
</script>
