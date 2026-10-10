<template>
  <img
    v-if="imageSrc && !imageExpired"
    :alt
    loading="lazy"
    decoding="async"
    :src="imageSrc"
    :class="imgClass"
    draggable="false"
  />
</template>

<script lang="ts" setup>
import { getArtworkExpiresAt, getArtworkUrl } from "@opfelmusig/lib/helpers";
import type { Artwork } from "@opfelmusig/lib/types";

const props = defineProps<{
  artwork?: Artwork;
  src?: string;
  alt?: string;
  width?: number;
  class?: string;
}>();

const { artwork: contextArtwork, imageSize } = useArtworkContext();

const imageSource = computed(() => props.src ?? props.artwork ?? contextArtwork.value);
const imageSrc = computed(() =>
  getArtworkUrl(imageSource.value, { width: props.width ?? imageSize.value }),
);
const imageExpiresAt = computed(() => getArtworkExpiresAt(imageSource.value));
const imageExpired = computed(() =>
  imageExpiresAt.value ? Date.now() > imageExpiresAt.value.getTime() : false,
);

const imgClass = computed(() => cn("size-full object-cover select-none", props.class));
</script>
