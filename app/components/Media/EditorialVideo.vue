<template>
  <div :class="artwork({ variant })">
    <MediaMotionVideo v-if="enabledMotionVideo" :paused :motion-video="enabledMotionVideo" />
    <template v-else>
      <slot name="fallback" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { EditorialVideo } from "@opfelmusig/lib/types";

const artwork = cva("flex size-full items-center justify-center overflow-hidden", {
  variants: {
    variant: {
      tall: "aspect-3/4",
      square: "aspect-square",
      wide: "aspect-21/9",
    },
  },
  defaultVariants: {
    variant: "square",
  },
});

export type EditorialVideoVariants = VariantProps<typeof artwork>["variant"];

const props = defineProps<{
  editorialVideo?: EditorialVideo;
  variant?: EditorialVideoVariants;
  paused?: boolean;
}>();
const settingsStore = useSettingsStore();

const motionVideo = computed(() => {
  switch (props.variant) {
    case "tall":
      return props.editorialVideo?.motionTallVideo3x4 ?? props.editorialVideo?.motionDetailTall;
    case "wide":
      return props.editorialVideo?.motionWideVideo21x9;
    case "square":
    default:
      return props.editorialVideo?.motionSquareVideo1x1 ?? props.editorialVideo?.motionDetailSquare;
  }
});

const enabledMotionVideo = computed(() =>
  settingsStore.player.animatedArtwork ? motionVideo.value : undefined,
);
const preview = computed(() => enabledMotionVideo.value?.previewFrame);
const exists = computed(() => !!enabledMotionVideo.value);

defineExpose({
  preview,
  exists,
});
</script>
