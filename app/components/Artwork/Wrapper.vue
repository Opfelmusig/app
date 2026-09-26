<template>
  <div :class="cn(variants({ size, color, round }), props.class)">
    <slot :icon-class :image-size :artwork />
  </div>
</template>

<script lang="ts" setup>
import type { Artwork } from "@opfelmusig/lib/types";

import type { ResolvedDbResource } from "#layers/libcore/app/database/types";

const variants = cva(
  "group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl select-none",
  {
    variants: {
      size: {
        xs: "size-5 rounded-md",
        sm: "size-9 rounded-lg",
        md: "size-12 rounded-xl",
        lg: "size-40 rounded-3xl",
        xl: "size-64 rounded-4xl",
        "2xl": "size-96 rounded-4xl",
      },
      round: {
        true: "rounded-full",
      },
      color: {
        error: "bg-error/20 text-error",
        muted: "bg-muted text-muted",
        loading: "animate-pulse bg-elevated text-muted",
      },
    },
    defaultVariants: {
      round: false,
    },
  },
);

const props = defineProps<{
  size?: VariantProps<typeof variants>["size"];
  color?: VariantProps<typeof variants>["color"];
  round?: boolean;
  class?: string;
  resource?: ResourceArtworkExtract | null;
  libraryResource?: ResolvedDbResource | null;
  artwork?: Artwork;
}>();

const isRoundedResource = computed(
  () =>
    props.resource?.type === "library-artists" ||
    props.resource?.type === "artists" ||
    props.resource?.type === "personal-social-profiles" ||
    props.resource?.type === "social-profiles" ||
    props.libraryResource?.type === "library-artists",
);
const round = computed(() => isRoundedResource.value || props.round);

const artwork = computed(
  () =>
    props.artwork ??
    resourceArtwork(props.resource) ??
    libraryResourceArtwork(props.libraryResource),
);

const imageSize = computed(() => {
  if (!props.size) return 96 * 2;

  if (props.size === "xs") return 20 * 2;
  if (props.size === "sm") return 40 * 2;
  if (props.size === "md") return 48 * 2;
  if (props.size === "lg") return 160 * 2;
  if (props.size === "xl") return 265 * 2;
  if (props.size === "2xl") return 512 * 2;
  else return 1024;
});

const iconClass = computed(() => {
  if (!props.size) return cn("size-12");

  if (props.size === "xs") return cn("size-3");
  if (props.size === "sm") return cn("size-4");
  if (props.size === "md") return cn("size-6");
  if (props.size === "lg") return cn("size-20");
  if (props.size === "xl") return cn("size-32");
  if (props.size === "2xl") return cn("size-48");
  else return cn("size-20");
});
</script>
