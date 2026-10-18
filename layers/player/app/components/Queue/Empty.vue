<template>
  <div
    v-if="queueStore.currentQueue.length <= 0 && queueStore.contextQueue.length <= 0"
    class="flex size-full items-center justify-center text-muted"
  >
    Nothing in the queue
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
</script>
