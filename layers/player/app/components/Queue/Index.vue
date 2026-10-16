<template>
  <div class="flex size-full flex-col overflow-hidden overflow-y-auto">
    <template v-if="showQueue">
      <OMTableTitle
        v-if="queueStore.context && queueStore.isShuffling"
        title="Continue playing"
        :context="queueStore.context"
        clearable
        @clear="queueStore.clearQueue"
      />
      <QueueList :key="queueStore.isShuffling ? 'shuffled' : 'queue'" :entries="upNext" />
    </template>
    <template v-if="showContextQueue">
      <USeparator class="first:hidden" />
      <OMTableTitle
        title="Continue playing"
        :context="queueStore.context"
        clearable
        @clear="queueStore.clearContext"
      />
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

const showContextQueue = computed(
  () => !queueStore.isShuffling && queueStore.contextQueue.length > 0,
);

const showQueue = computed(
  () => queueStore.currentQueue.length > 0 && (upNext.value.length > 0 || !showContextQueue.value),
);
</script>
