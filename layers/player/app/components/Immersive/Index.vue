<template>
  <div class="fixed inset-0 z-100 flex shrink-0 flex-col bg-default select-none">
    <div class="pointer-events-none fixed inset-0 z-10">
      <Transition>
        <ImmersiveMesh v-if="settingsStore.immersive.isOpen" class="duration-500" />
      </Transition>
    </div>

    <div class="pointer-events-none fixed inset-0 z-20 overflow-hidden">
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
      class="fixed inset-0 z-30 flex flex-col rounded-2xl border-4 border-bg"
      data-tauri-drag-region
    >
      <div class="h-8 w-full bg-default" data-tauri-drag-region></div>
      <div class="flex h-4 justify-between">
        <div class="flex size-4 items-start justify-start overflow-hidden">
          <div class="size-8 shrink-0 rounded-full outline-16 outline-neutral-900"></div>
        </div>
        <div class="flex size-4 items-start justify-end overflow-hidden">
          <div class="size-8 shrink-0 rounded-full outline-16 outline-neutral-900"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const queueStore = useQueueStore();
const settingsStore = useSettingsStore();

const resource = computed(() => queueStore.current?.entry.resource);
</script>
