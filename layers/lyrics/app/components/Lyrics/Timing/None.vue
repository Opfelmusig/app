<template>
  <div
    ref="scroller"
    :style
    class="flex h-full w-full scrollbar-thumb-white/40 flex-col gap-4 overflow-hidden overflow-y-auto p-2 text-lg"
  >
    <div
      v-for="(section, i) in lyrics.sections"
      :key="section.startMs ?? i"
      class="flex w-full flex-col gap-1"
    >
      <div v-for="(line, j) in section.lines" :key="line.key ?? j" class="inline-block">
        <span v-for="(node, k) in line.nodes" :key="node.startMs ?? k">{{ node.text }}</span>
      </div>
    </div>
    <LyricsFooter :songwriters="lyrics.metadata.songwriters" />
  </div>
</template>

<script lang="ts" setup>
import type { AppleMusicLyricsNoneDocument } from "#layers/lyrics/app/types/lyrics";

defineProps<{
  lyrics: AppleMusicLyricsNoneDocument;
}>();

const scroller = useTemplateRef("scroller");
const { style } = useCustomScrollShadow(scroller, {
  orientation: "vertical",
  size: 48,
});
</script>
