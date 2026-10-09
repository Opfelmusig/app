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

const imageSrc = computed(() => getArtworkUrl(props.src ?? props.artwork, { width: props.width }));
const imageExpiresAt = computed(() => getArtworkExpiresAt(props.src ?? props.artwork));
const imageExpired = computed(() =>
  imageExpiresAt.value ? Date.now() > imageExpiresAt.value.getTime() : false,
);

const imgClass = computed(() => cn("size-full object-cover select-none", props.class));
</script>
