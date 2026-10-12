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

import { artworkContextKey } from "#layers/amdata/app/lib/contexts/artwork";

const props = defineProps<{
  artwork?: Artwork;
  src?: string;
  alt?: string;
  width?: number;
  class?: string;
}>();

const context = inject(artworkContextKey);

const imageSource = computed(() => props.src ?? props.artwork ?? context?.artwork.value);
const imageSrc = computed(() =>
  getArtworkUrl(imageSource.value, { width: props.width ?? context?.imageSize.value }),
);
const imageExpiresAt = computed(() => getArtworkExpiresAt(imageSource.value));
const imageExpired = computed(() =>
  imageExpiresAt.value ? Date.now() > imageExpiresAt.value.getTime() : false,
);

const imgClass = computed(() => cn("size-full object-cover select-none", props.class));
</script>
