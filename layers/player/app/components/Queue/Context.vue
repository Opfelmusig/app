<template>
  <USeparator class="first:hidden" />
  <PanelHeader title="Continue playing" :context="queueStore.context" />
  <AMSongsWrapper
    :columns="[]"
    reorderable
    :reorder-ids="visibleUpNextContext.map((entry) => entry.id)"
    @reorder="reorder($event, overshootContext)"
  >
    <AMSongsItem
      v-for="(entry, i) in visibleUpNextContext"
      :key="entry.id"
      :song="entry.entry"
      :reorder-id="entry.id"
      @play="queueStore.playIndex(i + overshootContext)"
    />
    <OMTableStatus v-if="upNextContext.length > queueStore.maxDisplayedSongs">
      <div class="flex items-center gap-2">
        <OMIcon name="lucide:layout-grid" class="size-4" filled />
        <span
          >{{ upNextContext.length - queueStore.maxDisplayedSongs }} more
          {{ upNextContext.length - queueStore.maxDisplayedSongs === 1 ? "song" : "songs" }}</span
        >
      </div>
    </OMTableStatus>
  </AMSongsWrapper>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();

function reorder({ fromIndex, toIndex }: TableReorder, offset: number) {
  queueStore.moveIndex(fromIndex + offset, toIndex + offset);
}

const contextStart = computed(() => (queueStore.contextIndex ?? -1) + 1);
const upNextContext = computed(() => queueStore.contextQueue.slice(contextStart.value));
const visibleUpNextContext = computed(() =>
  upNextContext.value.slice(0, queueStore.maxDisplayedSongs),
);
const overshootContext = computed(() => queueStore.queue.length + contextStart.value);
</script>
