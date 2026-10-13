<template>
  <div class="relative size-full select-none">
    <div class="absolute inset-0 z-10 size-full">
      <MediaHlsVideo
        v-if="motionVideo.video"
        :paused
        :quality
        :poster="previewFrameUrl"
        :src="motionVideo.video"
      />
    </div>
    <img :src="previewFrameUrl" class="absolute inset-0 size-full" alt="poster" draggable="false" />
  </div>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";
import type { MotionVideo } from "@opfelmusig/lib/types";

const props = defineProps<{
  motionVideo: MotionVideo;
  paused?: boolean;
  quality?: "auto" | "highest";
}>();

const previewFrameUrl = computed(() =>
  getArtworkUrl(props.motionVideo.previewFrame.url, { width: 1024 }),
);
</script>
