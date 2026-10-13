<template>
  <div class="fixed inset-0 z-100 flex shrink-0 flex-col bg-default select-none">
    <div class="pointer-events-none fixed inset-1 top-9 z-10 overflow-hidden rounded-xl">
      <Transition>
        <ImmersiveMesh v-if="settingsStore.immersive.isOpen" class="duration-500" />
      </Transition>
    </div>

    <div
      class="pointer-events-none fixed inset-1 top-9 z-20 overflow-hidden rounded-xl"
      @load.capture="revealArtwork"
      @loadeddata.capture="revealArtwork"
    >
      <div
        v-if="resource?.attributes.editorialVideo || resource?.attributes.artwork"
        class="relative flex size-full justify-center"
      >
        <MediaEditorialVideo
          :editorial-video="resource?.attributes.editorialVideo"
          variant="square"
          :paused="!settingsStore.immersive.isOpen"
          class="absolute z-10 h-full w-full mask-[linear-gradient(to_right,transparent_1%,black_25%,black_75%,transparent_99%)] blur-xl transition-[filter,opacity]"
        >
          <template #fallback>
            <AMArtworkImage :src="getArtworkUrl(resource?.attributes.artwork, { width: 2048 })" />
          </template>
        </MediaEditorialVideo>
        <div
          class="relative z-20 aspect-square h-full mask-[linear-gradient(to_right,transparent_1%,black_25%,black_75%,transparent_99%)]"
        >
          <MediaEditorialVideo
            :editorial-video="resource?.attributes.editorialVideo"
            variant="square"
            :paused="!settingsStore.immersive.isOpen || settingsStore.immersive.page !== null"
            class="h-full transition-[filter,opacity] [&_img]:object-cover"
            :class="settingsStore.immersive.page === null ? '' : 'opacity-0'"
          >
            <template #fallback>
              <AMArtworkImage :src="getArtworkUrl(resource?.attributes.artwork, { width: 2048 })" />
            </template>
          </MediaEditorialVideo>
        </div>
      </div>
    </div>

    <div
      class="fixed inset-0 z-30 flex flex-col justify-between rounded-xl border-4 border-bg"
      data-tauri-drag-region
    >
      <div class="group relative flex h-13 w-full flex-col" data-tauri-drag-region>
        <div
          class="flex h-8 w-full items-end overflow-hidden bg-default px-0.5 text-muted shadow-2xl transition-[height]"
          data-tauri-drag-region
        >
          <div
            class="flex h-8 w-full shrink-0 items-center justify-end gap-1.5 pb-1"
            data-tauri-drag-region
          >
            <div class="mr-2 flex w-40 shrink-0 items-center gap-2" data-tauri-drag-region>
              <UIcon name="lucide:volume" class="size-3.5 shrink-0" />
              <USlider
                v-model="volumeStore.volume"
                :min="0"
                :max="1"
                :step="0.01"
                class="py-3"
                size="sm"
                :ui="{
                  range: 'bg-white transition-colors',
                }"
              />
              <UIcon name="lucide:volume-2" class="ml-1 size-3.5 shrink-0" />
            </div>
            <USeparator orientation="vertical" class="h-4 shrink-0" />
            <div
              class="flex gap-1.5"
              :class="isMacos ? '[&>button]:last:rounded-tr-[9px]' : ''"
              data-tauri-drag-region
            >
              <ImmersiveButton icon="lucide:list" @click="togglePage('queue')" />
              <ImmersiveButton
                icon="lucide:message-square-quote"
                small-icon
                @click="togglePage('lyrics')"
              />
              <ImmersiveButton
                icon="lucide:settings"
                aria-label="Open settings"
                :active="settingsStore.isOpen"
                small-icon
                @click="settingsStore.isOpen = true"
              />
              <ImmersiveButton icon="lucide:x" @click="settingsStore.immersive.isOpen = false" />
            </div>
          </div>
        </div>
        <div class="z-10 flex h-3.5 justify-between" data-tauri-drag-region>
          <ImmersiveReverseRadius position="tl" :size="14" />
          <ImmersiveReverseRadius position="tr" :size="14" />
        </div>
      </div>
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
              class="flex size-14 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-95"
              @click="queueStore.toggleShuffle"
            >
              <UIcon
                mode="svg"
                name="lucide:shuffle"
                class="size-6"
                :class="queueStore.isShuffling ? 'text-primary' : 'text-muted'"
              />
            </div>
            <div
              class="flex size-16 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-95"
              @click="playbackStore.previous"
            >
              <OMIcon mode="svg" name="lucide:skip-back" class="size-8" filled />
            </div>
            <div
              class="flex size-16 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-95"
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
                class="size-8"
                :filled="!playbackStore.pending"
                :class="playbackStore.pending ? 'animate-spin' : ''"
              />
            </div>
            <div
              class="flex size-16 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-95"
              @click="queueStore.next"
            >
              <OMIcon mode="svg" name="lucide:skip-forward" class="size-8" filled />
            </div>
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-full transition-transform hover:bg-muted active:scale-95"
              @click="queueStore.isLooping = !queueStore.isLooping"
            >
              <UIcon
                mode="svg"
                name="lucide:repeat"
                class="size-6"
                :class="queueStore.isLooping ? 'text-primary' : 'text-muted'"
              />
            </div>
          </div>
        </div>
        <ImmersiveReverseRadius position="bl" :size="24" class="z-10" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const queueStore = useQueueStore();
const settingsStore = useSettingsStore();
const volumeStore = useVolumeStore();
const playbackStore = usePlaybackStore();
const seekPosition = ref<number | null>(null);

function revealArtwork(event: Event) {
  const media = event.target;
  if (!(media instanceof HTMLImageElement || media instanceof HTMLVideoElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  media.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    easing: "ease-out",
  });
}

function commitSeek() {
  if (seekPosition.value !== null) playbackStore.seek(seekPosition.value);
  seekPosition.value = null;
}

function togglePage(page: "queue" | "lyrics") {
  const immersive = settingsStore.immersive;
  immersive.isOpen = !immersive.isOpen || immersive.page !== page;
  immersive.page = page;
}

const resource = computed(() => queueStore.current?.entry.resource);
</script>
