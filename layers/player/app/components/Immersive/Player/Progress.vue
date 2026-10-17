<template>
  <PlayerProgress
    :key="queueStore.current?.id"
    :position="playbackStore.position"
    :duration="playbackStore.duration"
    :disabled="!queueStore.current"
    size="lg"
    class="text-sm"
    @seek="playbackStore.seek"
  />
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
</script>
