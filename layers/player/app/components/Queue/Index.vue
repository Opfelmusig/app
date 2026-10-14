<template>
  <div class="flex size-full flex-col overflow-hidden overflow-y-auto">
    <QueueCurrent v-if="queueStore.currentQueue.length > 0" />
    <QueueContext v-if="!queueStore.isShuffling && queueStore.contextQueue.length > 0" />
    <QueueEmpty />
    <QueueFooter />
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
</script>
