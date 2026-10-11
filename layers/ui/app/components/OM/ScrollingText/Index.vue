<template>
  <span
    ref="viewport"
    :class="cn('block w-full min-w-0 overflow-hidden', active && 'scrolling-text')"
    :data-tauri-drag-region="drag"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <span
      ref="track"
      class="flex w-max whitespace-nowrap"
      :style="{ gap: `${gap}px` }"
      :data-tauri-drag-region="drag"
    >
      <span ref="content" class="block w-max min-w-max shrink-0" :data-tauri-drag-region="drag">
        <slot />
      </span>
      <span
        v-if="overflowing"
        inert
        aria-hidden="true"
        class="block w-max min-w-max shrink-0"
        :data-tauri-drag-region="drag"
      >
        <slot />
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
const viewport = useTemplateRef("viewport");
const track = useTemplateRef("track");
const content = useTemplateRef("content");

const gap = 16;
const speed = 40;
const delay = 2000;
const overflowing = ref(false);
const active = computed(() => overflowing.value);
const group = inject(scrollingTextGroupKey, undefined) ?? createScrollingTextGroup();

let hovered = false;
let frame: number | undefined;
let distance = 0;
let shouldRestart = false;

defineProps<{
  drag?: boolean;
}>();

const unregister = group.register({
  getTravelDuration: () => (active.value ? (distance / speed) * 1000 : 0),
  isHovered: () => hovered,
  createAnimations,
});

function createAnimations(groupTravelMs: number): Animation[] {
  if (!viewport.value || !track.value || !active.value) return [];

  const travelMs = (distance / speed) * 1000;
  const delayMs = delay;
  const duration = groupTravelMs + delayMs;
  const travelOffset = travelMs / duration;
  const timing: KeyframeAnimationOptions = {
    delay: delayMs,
    duration,
    easing: "linear",
    fill: "backwards",
    iterations: Infinity,
  };

  const movement = track.value.animate(
    [
      { transform: "translateX(0)", offset: 0 },
      { transform: `translateX(-${distance}px)`, offset: travelOffset },
      { transform: `translateX(-${distance}px)`, offset: 1 },
    ],
    timing,
  );
  const mask = viewport.value.animate(maskKeyframes(travelMs, delayMs, duration), timing);

  return [movement, mask];
}

function maskKeyframes(travelMs: number, delayMs: number, duration: number): Keyframe[] {
  if (!delayMs) {
    return [
      { "--scrolling-text-left-opacity": "0", offset: 0 },
      { "--scrolling-text-left-opacity": "0", offset: 1 },
    ];
  }

  const fadeMs = Math.min(200, delayMs, travelMs / 2);

  return [
    { "--scrolling-text-left-opacity": "1", offset: 0 },
    { "--scrolling-text-left-opacity": "0", offset: fadeMs / duration },
    { "--scrolling-text-left-opacity": "0", offset: travelMs / duration },
    {
      "--scrolling-text-left-opacity": "1",
      offset: (travelMs + fadeMs) / duration,
    },
    { "--scrolling-text-left-opacity": "1", offset: 1 },
  ];
}

function measure(restart = false) {
  frame = undefined;

  if (!viewport.value || !content.value) return;

  const viewportWidth = viewport.value.getBoundingClientRect().width;
  const contentWidth = content.value.getBoundingClientRect().width;
  const nextDistance = contentWidth > viewportWidth + 1 ? contentWidth + gap : 0;
  const changed = Math.abs(nextDistance - distance) > 0.5;

  distance = nextDistance;
  overflowing.value = distance > 0;

  if (restart || changed) group.restart();
}

function refresh(restart = false) {
  shouldRestart ||= restart;

  if (frame !== undefined) return;

  frame = requestAnimationFrame(() => {
    const restartAnimation = shouldRestart;
    shouldRestart = false;
    measure(restartAnimation);
  });
}

function onPointerEnter() {
  hovered = true;
  group.syncPlayback();
}

function onPointerLeave() {
  hovered = false;
  group.syncPlayback();
}

useResizeObserver([viewport, content], () => refresh());
useMutationObserver(content, () => refresh(true), {
  childList: true,
  characterData: true,
  subtree: true,
});

onMounted(() => refresh(true));

onBeforeUnmount(() => {
  unregister();

  if (frame !== undefined) cancelAnimationFrame(frame);
});
</script>

<style scoped>
@property --scrolling-text-left-opacity {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

.scrolling-text {
  --scrolling-text-left-opacity: 1;

  mask-image: linear-gradient(
    to right,
    rgb(0 0 0 / var(--scrolling-text-left-opacity)),
    black 8px,
    black calc(100% - 8px),
    transparent
  );
}
</style>
