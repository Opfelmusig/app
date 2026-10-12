<template>
  <div
    :class="lineClass({ active: lineActive, align: rightAligned ? 'right' : 'left' })"
    @click="seek"
  >
    <div class="inline-block w-full transition-colors duration-1000">
      <template v-for="(node, i) in line.nodes" :key="i">
        <span v-if="node.endMs == null || node.startMs == null || node.text.trim() === ''">
          {{ node.text }}
        </span>
        <LyricsTimingInlineNode v-else :finished="lineFinished" :node="node" :progress="progress" />
      </template>
    </div>
    <template v-for="variant in variants" :key="`${variant.lang}-${line.key}-${line.type}`">
      <div class="inline-block w-full text-xl opacity-50 duration-1000">
        <template v-for="(node, i) in variant.nodes" :key="i">
          <span v-if="node.endMs == null || node.startMs == null || node.text.trim() === ''">
            {{ node.text }}
          </span>
          <LyricsTimingInlineNode
            v-else
            :finished="lineFinished"
            :node="node"
            :progress="progress"
            is-variant
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { LyricInlineTimedLine, LyricVariant } from "#layers/lyrics/app/types/lyrics";

const props = defineProps<{
  line: LyricInlineTimedLine;
  variants: LyricVariant[];
  progress: number;
}>();

const lineActive = computed(
  () => props.progress >= props.line.startMs && props.progress <= props.line.endMs,
);

const lineFinished = computed(() => props.progress > props.line.endMs);

const emit = defineEmits<{
  (e: "seek", time: number | null): void;
}>();

const seek = () => emit("seek", props.line.startMs);

const rightAligned = computed(() => {
  const agents = props.line.agentIds?.map((a) => a.toLowerCase());

  if (!agents) return false;

  if (agents.includes("v2")) return true;
  if (agents.includes("voice2")) return true;

  return false;
});

const lineClass = cva(
  "flex w-full cursor-pointer flex-col gap-1 transition-all duration-500 hover:text-toned hover:blur-none",
  {
    variants: {
      active: {
        true: "scale-100",
        false: "scale-90 blur-[1px]",
      },
      align: {
        left: "origin-left",
        right: "origin-right text-right",
      },
    },
  },
);
</script>
