<template>
  <div class="flex size-full flex-col overflow-hidden overflow-y-auto">
    <template v-if="queueStore.currentQueue.length > 0">
      <PanelHeader
        v-if="queueStore.context && queueStore.isShuffling"
        title="Continue playing"
        :context="queueStore.context"
      />
      <QueueList :key="queueStore.isShuffling ? 'shuffled' : 'queue'" :entries="upNext" />
    </template>
    <template v-if="!queueStore.isShuffling && queueStore.contextQueue.length > 0">
      <USeparator class="first:hidden" />
      <PanelHeader title="Continue playing" :context="queueStore.context" />
      <QueueList :entries="upNextContext" />
    </template>
    <QueueEmpty />
    <QueueFooter />
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();

const upNext = computed(() => queueStore.currentQueue.slice((queueStore.index ?? -1) + 1));
const upNextContext = computed(() =>
  queueStore.contextQueue.slice((queueStore.contextIndex ?? -1) + 1),
);
</script>
