<template>
  <div
    class="pointer-events-none absolute inset-0 z-20 overflow-hidden transition-[opacity,filter]"
    :class="settingsStore.immersive.lyrics ? 'opacity-80 brightness-40' : ''"
  >
    <div
      v-for="layer in layers"
      :key="layer.key"
      class="absolute inset-0 transition-opacity duration-500 ease-out starting:opacity-0"
      :class="layer.visible ? 'opacity-100' : 'opacity-0'"
      @transitionend.self="finishTransition(layer, $event)"
    >
      <div v-if="settingsStore.immersive.enhanced" class="relative flex size-full justify-center">
        <div
          class="absolute z-10 flex size-full h-full w-full items-center justify-center overflow-hidden blur-xl transition-[filter,opacity]"
          :style="{ maskImage: artworkMask }"
        >
          <AMArtworkImage :src="getArtworkUrl(layer.resource.attributes.artwork, { width: 512 })" />
        </div>
        <div
          class="relative z-20 aspect-square h-full"
          :style="{ maskImage: artworkMask }"
          @load.capture="revealArtwork(layer)"
          @loadeddata.capture="revealArtwork(layer)"
        >
          <AMMediaEditorialVideo
            :editorial-video="layer.resource.attributes.editorialVideo"
            variant="square"
            quality="highest"
            :paused="!settingsStore.immersive.isOpen"
            class="h-full transition-opacity [&_img]:object-cover"
          >
            <template #fallback>
              <AMArtworkImage
                :src="getArtworkUrl(layer.resource.attributes.artwork, { width: 2048 })"
              />
            </template>
          </AMMediaEditorialVideo>
        </div>
      </div>
      <AMMediaEditorialVideo
        v-else
        :editorial-video="layer.resource.attributes.editorialVideo"
        variant="square"
        quality="highest"
        :paused="!settingsStore.immersive.isOpen"
        class="z-20 size-full transition-opacity [&_img]:object-cover"
        @load.capture="revealArtwork(layer)"
        @loadeddata.capture="revealArtwork(layer)"
      >
        <template #fallback>
          <AMArtworkImage
            :src="getArtworkUrl(layer.resource.attributes.artwork, { width: 2048 })"
          />
        </template>
      </AMMediaEditorialVideo>
    </div>
    <div v-if="!layers.length" class="flex size-full items-center justify-center bg-muted">
      <OMIcon name="lucide:music" class="size-12" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

const queueStore = useQueueStore();
const settingsStore = useSettingsStore();

interface ArtworkLayer {
  key: string;
  resource: AmSong;
  visible: boolean;
}

const layers = shallowRef<ArtworkLayer[]>([]);
const artworkKey = computed(() => {
  const attributes = queueStore.current?.entry.attributes;
  const video =
    attributes?.editorialVideo?.motionSquareVideo1x1 ??
    attributes?.editorialVideo?.motionDetailSquare;

  return JSON.stringify([
    getArtworkUrl(attributes?.artwork, { width: 2048 }),
    settingsStore.player.animatedArtwork ? video?.video : undefined,
  ]);
});

watch(
  artworkKey,
  (key) => {
    const resource = queueStore.current?.entry;
    const previous = layers.value.findLast((layer) => layer.visible);
    layers.value = previous ? [previous] : [];

    if (resource?.attributes.editorialVideo || resource?.attributes.artwork) {
      if (previous?.key === key) return;
      layers.value = [...layers.value, { key, resource, visible: false }];
    } else {
      layers.value = [];
    }
  },
  { immediate: true },
);

function revealArtwork(layer: ArtworkLayer) {
  if (layer.visible || layer !== layers.value.at(-1)) return;
  layers.value = layers.value.map((entry) => ({ ...entry, visible: entry === layer }));
}

function finishTransition(layer: ArtworkLayer, event: TransitionEvent) {
  if (event.propertyName === "opacity" && layer.visible && layer === layers.value.at(-1)) {
    layers.value = [layer];
  }
}

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
