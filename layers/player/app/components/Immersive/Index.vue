<template>
  <div class="fixed inset-0 z-100 flex shrink-0 flex-col bg-default select-none">
    <div class="pointer-events-none fixed inset-1 z-10 overflow-hidden rounded-xl">
      <Transition>
        <ImmersiveMesh v-if="settingsStore.immersive.isOpen" class="duration-500" />
      </Transition>
    </div>

    <div class="pointer-events-none fixed inset-1 z-20 overflow-hidden rounded-xl">
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
      class="fixed inset-0 z-30 flex flex-col rounded-xl border-4 border-bg"
      data-tauri-drag-region
    >
      <div class="group relative flex h-13 w-full flex-col" data-tauri-drag-region>
        <div
          class="flex h-0 w-full items-end overflow-hidden bg-default px-0.5 text-muted transition-[height] group-hover:h-8"
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
              <ImmersiveButton icon="lucide:x" @click="settingsStore.immersive.isOpen = false" />
            </div>
          </div>
        </div>
        <div class="flex h-3.5 justify-between" data-tauri-drag-region>
          <div class="flex size-3.5 items-start justify-start overflow-hidden">
            <div class="size-full shrink-0 rounded-tl-[14px] outline-16 outline-neutral-900" />
          </div>
          <div class="flex size-3.5 items-start justify-end overflow-hidden">
            <div class="size-full shrink-0 rounded-tr-[14px] outline-16 outline-neutral-900" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const queueStore = useQueueStore();
const settingsStore = useSettingsStore();
const volumeStore = useVolumeStore();

function togglePage(page: "queue" | "lyrics") {
  const immersive = settingsStore.immersive;
  immersive.isOpen = !immersive.isOpen || immersive.page !== page;
  immersive.page = page;
}

const resource = computed(() => queueStore.current?.entry.resource);
</script>
