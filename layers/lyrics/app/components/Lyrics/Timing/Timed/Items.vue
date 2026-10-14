<template>
  <template v-if="item.type === 'line'">
    <LyricsTimingLineItem
      v-if="item.line.type === 'timed-line'"
      :line="item.line"
      :variants="variants"
      :progress="progress"
      @seek="seek"
    />
    <LyricsTimingInlineItem
      v-else
      :line="item.line"
      :variants="variants"
      :progress="progress"
      @seek="seek"
    />
  </template>
  <LyricsTimingTimedSilence v-else :silence="item" :progress="progress" @seek="seek" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  item: LyricsTimelineItem;
  progress: number;
  metadata: LyricMetadata;
}>();

const emit = defineEmits<{
  (e: "seek", time: number | null): void;
}>();

const seek = (time: number | null) => emit("seek", time);

const settingsStore = useSettingsStore();

const variants = computed(() => {
  if (props.item.type !== "line" || !props.item.line.key) return [];

  const lineTransliterations = props.metadata.transliterationsByLine[props.item.line.key];

  const lineTranslations = props.metadata.translationsByLine[props.item.line.key];

  const variants: LyricVariant[] = [];

  if (lineTransliterations?.[0] && settingsStore.lyrics.showTransliteration) {
    variants.push(lineTransliterations[0]);
  }

  if (lineTranslations?.[0] && settingsStore.lyrics.showTranslation) {
    variants.push(lineTranslations[0]);
  }

  return variants;
});
</script>
