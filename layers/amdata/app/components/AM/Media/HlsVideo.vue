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
    @error="logMediaError"
  />
</template>

<script setup lang="ts">
import Hls, { FetchLoader } from "hls.js";
import type HlsType from "hls.js";
import { firstBy } from "remeda";

const props = defineProps<{
  src: string;
  poster?: string;
  paused?: boolean;
  quality?: "auto" | "highest";
}>();

const video = ref<HTMLVideoElement | null>(null);
const log = logger.withTag("hls");

function playbackContext() {
  return {
    src: props.src,
    quality: props.quality ?? "auto",
    level: hls?.loadLevel,
    videoCodec: hls?.levels[hls.loadLevel]?.videoCodec,
  };
}

function logMediaError() {
  log.error("Motion video media error", {
    code: video.value?.error?.code,
    message: video.value?.error?.message,
    ...playbackContext(),
  });
}

function syncPlayback() {
  if (!video.value) return;

  if (props.paused) {
    video.value.pause();
  } else {
    video.value.play().catch((cause) => {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        return;
      }

      log.error("Could not play motion video", { cause });
    });
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

onMounted(() => {
  if (!video.value) return;

  supportsNativeHls = video.value.canPlayType("application/vnd.apple.mpegurl") !== "";

  if (Hls.isSupported()) {
    hls = new Hls({
      loader: FetchLoader,
      autoStartLoad: false,
      videoPreference: { videoCodec: "avc1" },
      fetchSetup(context, initParams) {
        if (context.rangeEnd !== undefined) {
          initParams.cache = "no-store";
        }

        return new Request(context.url, initParams);
      },
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      const context = {
        type: data.type,
        details: data.details,
        fatal: data.fatal,
        cause: data.error,
        status: data.response?.code,
        ...playbackContext(),
      };

      if (data.fatal) log.error("Fatal motion video HLS error", context);
      else log.warn("Motion video HLS error", context);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (!hls) return;

      if (props.quality === "highest" && hls.levels.length) {
        const bestLevel = firstBy(
          hls.levels
            .map((level, index) => ({ level, index }))
            .filter(({ level }) => level.videoCodec?.startsWith("avc1")),
          [({ level }) => level.width * level.height, "desc"],
          [({ level }) => level.bitrate, "desc"],
        )?.index;

        if (bestLevel !== undefined) {
          hls.startLevel = bestLevel;
          hls.loadLevel = bestLevel;
        }
      }

      log.debug("Motion video manifest parsed", {
        ...playbackContext(),
        version: Hls.version,
        startLevel: hls.startLevel,
        levels: hls.levels.map((level, index) => ({
          index,
          width: level.width,
          height: level.height,
          bitrate: level.bitrate,
        })),
      });
      hls.startLoad();
    });
    loadSource(props.src);
    hls.attachMedia(video.value);

    return;
  }

  if (supportsNativeHls) {
    loadSource(props.src);
  } else {
    log.error("Motion video HLS playback is not supported", { version: Hls.version });
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
