<template>
  <div class="flex w-full items-center gap-4 text-sm text-muted tabular-nums">
    <span>{{ msToHMS((seekPosition ?? playbackStore.position) * 1000) }}</span>
    <USlider
      :model-value="seekPosition ?? playbackStore.position"
      :min="0"
      :max="playbackStore.duration || 1"
      :step="0.1"
      :disabled="!resource || !playbackStore.duration"
      class="w-full py-2"
      size="lg"
      @update:model-value="seekPosition = $event ?? null"
      @change="commitSeek"
    />
    <span>{{ msToHMS(playbackStore.duration * 1000) }}</span>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
const seekPosition = ref<number | null>(null);

function commitSeek() {
  if (seekPosition.value !== null) playbackStore.seek(seekPosition.value);
  seekPosition.value = null;
}

const resource = computed(() => queueStore.current?.entry.resource);
</script>
