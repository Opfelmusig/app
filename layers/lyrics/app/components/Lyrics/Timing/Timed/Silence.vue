<template>
  <div
    :class="silenceClass({ active: lineActive, complete: silenceProgress === 1 && lineActive })"
    @click="seek"
  >
    <div
      v-for="i in 3"
      :key="i"
      :class="
        silenceDotClass({
          active: silenceProgress > (i - 1) / 3 && silenceProgress > 0 && lineActive,
        })
      "
    />
  </div>
</template>

<script lang="ts" setup>
import type { LyricsTimelineItemSilence } from "#layers/lyrics/app/types/timeline";

const props = defineProps<{
  silence: LyricsTimelineItemSilence;
  progress: number;
}>();

const SILENCE_PUFFER = 500;

const silenceProgress = computed(() => {
  const startMs = props.silence.startMs + SILENCE_PUFFER;
  const endMs = props.silence.endMs - SILENCE_PUFFER;
  const duration = endMs - startMs;

  if (duration <= 0) return 0;

  return Math.max(0, Math.min(1, (props.progress - startMs) / duration));
});

const lineActive = computed(
  () =>
    props.silence.startMs != null &&
    props.silence.endMs != null &&
    props.progress >= props.silence.startMs &&
    props.progress <= props.silence.endMs,
);

const silenceClass = cva(
  "flex h-9 w-max origin-left items-center gap-2 py-2 transition-all duration-500 ease-in-out",
  {
    variants: {
      active: {
        true: "animate-scale-pulse",
        false: "scale-0 blur-md",
      },
      complete: {
        true: "scale-125",
      },
    },
  },
);

const silenceDotClass = cva("size-4 shrink-0 rounded-full transition-all duration-500", {
  variants: {
    active: {
      true: "scale-105 bg-inverted",
      false: "bg-white/20",
    },
  },
});

const emit = defineEmits<{
  (e: "seek", time: number | null): void;
}>();

const seek = () => emit("seek", props.silence.startMs);
</script>
