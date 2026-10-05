<template>
  <div ref="container" class="w-full min-w-0 border-t border-default p-4">
    <div class="grid w-full gap-4" :style="gridStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const container = useTemplateRef("container");

const containerWidth = ref(0);

const min = 180;
const max = 260;
const gap = 16;

let observer: ResizeObserver | undefined;

onMounted(() => {
  if (!container.value) return;

  observer = new ResizeObserver(([entry]) => {
    if (entry) containerWidth.value = entry.contentRect.width;
  });
  observer.observe(container.value);
});

onUnmounted(() => observer?.disconnect());

const columns = computed(() => Math.max(1, Math.floor((containerWidth.value + gap) / (min + gap))));

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
  maxWidth: `${columns.value * max + (columns.value - 1) * gap}px`,
}));
</script>
