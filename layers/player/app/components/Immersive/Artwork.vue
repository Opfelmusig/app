<template>
  <div
    class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl"
    @load.capture="revealArtwork"
    @loadeddata.capture="revealArtwork"
  >
    <div
      v-if="resource?.attributes.editorialVideo || resource?.attributes.artwork"
      class="relative flex size-full justify-center"
    >
      <div
        class="absolute z-10 flex size-full h-full w-full items-center justify-center overflow-hidden mask-[linear-gradient(to_right,transparent_1%,black_25%,black_75%,transparent_99%)] blur-xl transition-[filter,opacity]"
      >
        <AMArtworkImage :src="getArtworkUrl(resource?.attributes.artwork, { width: 512 })" />
      </div>
      <div
        class="relative z-20 aspect-square h-full mask-[linear-gradient(to_right,transparent_1%,black_25%,black_75%,transparent_99%)]"
      >
        <AMMediaEditorialVideo
          :editorial-video="resource?.attributes.editorialVideo"
          variant="square"
          quality="highest"
          :paused="!settingsStore.immersive.isOpen"
          class="h-full transition-[filter,opacity] [&_img]:object-cover"
        >
          <template #fallback>
            <AMArtworkImage :src="getArtworkUrl(resource?.attributes.artwork, { width: 2048 })" />
          </template>
        </AMMediaEditorialVideo>
      </div>
    </div>
    <div class="flex size-full items-center justify-center bg-muted">
      <OMIcon name="lucide:music" class="size-12" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const queueStore = useQueueStore();
const settingsStore = useSettingsStore();

function revealArtwork(event: Event) {
  const media = event.target;
  if (!(media instanceof HTMLImageElement || media instanceof HTMLVideoElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  media.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    easing: "ease-out",
  });
}

const resource = computed(() => queueStore.current?.entry.resource);
</script>
