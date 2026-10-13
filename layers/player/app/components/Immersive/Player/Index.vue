<template>
  <div v-if="resource" class="flex items-end justify-center">
    <ImmersiveReverseRadius position="br" :size="24" class="z-10" />
    <div class="flex w-120 flex-col gap-4 rounded-t-4xl bg-default p-4 px-6 shadow-2xl">
      <OMScrollingTextGroup class="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
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
      <div class="flex w-full items-center gap-4 text-sm text-muted tabular-nums">
        <span>{{ msToHMS((seekPosition ?? playbackStore.position) * 1000) }}</span>
        <USlider
          :model-value="seekPosition ?? playbackStore.position"
          :min="0"
          :max="playbackStore.duration || 1"
          :step="0.1"
          :disabled="!resource || !playbackStore.duration"
          class="w-full py-2"
          size="lg"
          @update:model-value="seekPosition = $event ?? null"
          @change="commitSeek"
        />
        <span>{{ msToHMS(playbackStore.duration * 1000) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
          :class="queueStore.isShuffling ? 'bg-white/20' : 'hover:bg-muted'"
          @click="queueStore.toggleShuffle"
        >
          <UIcon
            name="lucide:shuffle"
            class="size-5"
            :class="queueStore.isShuffling ? 'text-white' : 'text-muted'"
          />
        </div>
        <ImmersivePlayerButton icon="lucide:skip-back" filled @click="playbackStore.previous" />
        <ImmersivePlayerButton
          :icon="playbackStore.paused ? 'lucide:play' : 'lucide:pause'"
          :loading="playbackStore.pending"
          filled
          @click="playbackStore.toggle"
        />
        <ImmersivePlayerButton icon="lucide:skip-forward" filled @click="queueStore.next" />
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
          :class="queueStore.isLooping ? 'bg-white/20' : 'hover:bg-muted'"
          @click="queueStore.isLooping = !queueStore.isLooping"
        >
          <UIcon
            name="lucide:repeat"
            class="size-5"
            :class="queueStore.isLooping ? 'text-white' : 'text-muted'"
          />
        </div>
      </div>
    </div>
    <ImmersiveReverseRadius position="bl" :size="24" class="z-10" />
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

const resource = computed(() => queueStore.current?.entry.resource);
</script>
