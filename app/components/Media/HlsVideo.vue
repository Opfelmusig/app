<template>
  <video
    ref="video"
    playsinline
    :poster
    preload="metadata"
    loop
    muted
    :autoplay="!paused"
    class="size-full object-cover select-none"
    @canplay="syncPlayback"
  />
</template>

<script setup lang="ts">
import Hls, { FetchLoader } from "hls.js";
import type HlsType from "hls.js";

const props = defineProps<{
  src: string;
  poster?: string;
  paused?: boolean;
}>();

const video = ref<HTMLVideoElement | null>(null);

function syncPlayback() {
  if (!video.value) return;

  if (props.paused) {
    video.value.pause();
  } else {
    video.value.play().catch(() => undefined);
  }
}

watch(
  () => props.paused,
  () => syncPlayback(),
);

let hls: HlsType | null = null;
let supportsNativeHls = false;

function loadSource(src: string) {
  if (!video.value) return;

  if (hls) {
    hls.loadSource(src);
    return;
  }

  if (supportsNativeHls) {
    video.value.src = src;
    video.value.load();
  }
}

onMounted(async () => {
  if (!video.value) {
    await nextTick();
  }

  if (!video.value) return;

  supportsNativeHls = video.value.canPlayType("application/vnd.apple.mpegurl") !== "";

  if (Hls.isSupported()) {
    hls = new Hls({
      loader: FetchLoader,
      videoPreference: {
        videoCodec: "avc1",
      },
      fetchSetup(context, initParams) {
        if (context.rangeEnd !== undefined) {
          initParams.cache = "no-store";
        }

        return new Request(context.url, initParams);
      },
    });
    loadSource(props.src);
    hls.attachMedia(video.value);

    return;
  }

  if (supportsNativeHls) {
    loadSource(props.src);
  }
});

watch(
  () => props.src,
  (src) => {
    if (!src) return;

    loadSource(src);
  },
);

onBeforeUnmount(() => {
  hls?.destroy();

  hls = null;

  if (video.value) {
    video.value.removeAttribute("src");
    video.value.load();
  }
});
</script>
