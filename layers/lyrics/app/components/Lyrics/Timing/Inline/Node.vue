<template>
  <span
    :class="
      cn(
        'relative inline-block transition-all duration-1000',
        nodeActive && !finished ? '-translate-y-1' : 'translate-y-0',
        node.role === 'x-bg' && 'text-lg opacity-50',
      )
    "
  >
    <span ref="text" class="z-0 whitespace-nowrap">
      {{ node.text }}
    </span>
    <span
      class="absolute inset-0 z-20 overflow-hidden whitespace-nowrap text-highlighted transition-opacity duration-500"
      :class="
        cn(
          !finished ? 'opacity-100' : 'opacity-0',
          nodeDirectActive && 'mask-r-from-[calc(100%-8px)] mask-r-to-101%',
        )
      "
      :style="{ width: `${nodeProgress * 100}%` }"
      >{{ node.text }}</span
    >
    <span
      v-if="!finished && specialNode && !isVariant"
      class="absolute inset-0 z-10 transform-gpu overflow-hidden whitespace-nowrap text-highlighted/60 blur-sm will-change-[filter]"
      :class="cn(nodeProgress < 1 ? 'opacity-100' : 'opacity-0 duration-1000')"
      :style="{ width: `${nodeProgress * 100}%` }"
      >{{ node.text }}</span
    >
  </span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  node: LyricInlineTimedTextNode;
  progress: number;
  finished: boolean;
  isVariant?: boolean;
}>();

const nodeActive = computed(
  () =>
    props.node.startMs != null && props.node.endMs != null && props.progress >= props.node.startMs,
);

const nodeDirectActive = computed(
  () =>
    props.node.startMs != null &&
    props.node.endMs != null &&
    props.progress >= props.node.startMs &&
    props.progress <= props.node.endMs,
);

const nodeDuration = computed(() => {
  const { startMs, endMs } = props.node;

  if (startMs === null || endMs === null) return 0;

  const duration = endMs - startMs;

  return duration;
});

const nodeProgress = computed(() => {
  const { startMs, endMs } = props.node;

  if (startMs === null || endMs === null) return 1;

  if (nodeDuration.value <= 0) return 0;
  if (props.progress <= startMs) return 0;
  if (props.progress >= endMs) return 1;

  return (props.progress - startMs) / nodeDuration.value;
});

const textNode = useTemplateRef("text");

const specialNode = computed(() => {
  if (!textNode.value) return;

  const length = textNode.value.getBoundingClientRect().width;

  return nodeDuration.value / length > 20 && length > 15;
});
</script>
