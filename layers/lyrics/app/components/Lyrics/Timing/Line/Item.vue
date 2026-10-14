<template>
  <div
    :class="lineClass({ active: lineActive, align: rightAligned ? 'right' : 'left' })"
    @click="seek"
  >
    <div class="inline-block w-full">
      <span v-for="(node, i) in line.nodes" :key="i">{{ node.text }}</span>
    </div>
    <template v-for="variant in variants" :key="`${variant.lang}-${line.key}-${line.type}`">
      <div v-if="variant" class="inline-block w-full text-xl opacity-50">
        <span v-for="(node, i) in variant.nodes" :key="i">{{ node.text }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  line: LyricLineTimedLine;
  variants: LyricVariant[];
  progress: number;
}>();

const lineActive = computed(
  () =>
    props.line.startMs != null &&
    props.line.endMs != null &&
    props.progress >= props.line.startMs &&
    props.progress <= props.line.endMs,
);

const rightAligned = computed(() => {
  const agents = props.line.agentIds?.map((a) => a.toLowerCase());

  if (!agents) return false;

  if (agents.includes("v2")) return true;
  if (agents.includes("voice2")) return true;

  return false;
});

const lineClass = cva(
  "flex w-full cursor-pointer flex-col gap-1 transition-all duration-300 hover:text-highlighted hover:blur-none",
  {
    variants: {
      active: {
        true: "scale-100 text-highlighted",
        false: "scale-90 blur-[1px]",
      },
      align: {
        left: "origin-left",
        right: "origin-right text-right",
      },
    },
  },
);

const emit = defineEmits<{
  (e: "seek", time: number | null): void;
}>();

const seek = () => emit("seek", props.line.startMs);
</script>
