<template>
  <div
    class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl transition-[opacity,filter]"
    :class="settingsStore.immersive.lyrics ? 'opacity-80 brightness-40' : ''"
    @load.capture="revealArtwork"
    @loadeddata.capture="revealArtwork"
  >
    <div
      v-if="resource?.attributes.editorialVideo || resource?.attributes.artwork"
      class="relative flex size-full justify-center"
    >
      <div
        class="absolute z-10 flex size-full h-full w-full items-center justify-center overflow-hidden blur-xl transition-[filter,opacity]"
        :style="{ maskImage: artworkMask }"
      >
        <AMArtworkImage :src="getArtworkUrl(resource?.attributes.artwork, { width: 512 })" />
      </div>
      <div class="relative z-20 aspect-square h-full" :style="{ maskImage: artworkMask }">
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
    <div v-else class="flex size-full items-center justify-center bg-muted">
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

const stops = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const position = 25 * (3 * (1 - t) ** 2 * t * 0.42 + 3 * (1 - t) * t ** 2 * 0.58 + t ** 3);
  const opacity = 3 * (1 - t) * t ** 2 + t ** 3;

  return { position, opacity: Number(opacity.toFixed(5)) };
});

const start = stops.map(
  (stop) => `rgb(0 0 0 / ${stop.opacity}) ${Number(stop.position.toFixed(5))}%`,
);

const end = stops
  .toReversed()
  .map((stop) => `rgb(0 0 0 / ${stop.opacity}) ${Number((100 - stop.position).toFixed(5))}%`);

const artworkMask = `linear-gradient(to right, ${[...start, ...end].join(", ")})`;
</script>
