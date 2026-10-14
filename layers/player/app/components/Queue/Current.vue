<template>
  <PanelHeader
    v-if="queueStore.context && queueStore.isShuffling"
    title="Continue playing"
    :context="queueStore.context"
  />
  <AMSongsWrapper
    :key="queueStore.isShuffling ? 'shuffled' : 'queue'"
    :columns="[]"
    reorderable
    :reorder-ids="visibleUpNext.map((entry) => entry.id)"
    @reorder="reorder($event, overshoot)"
  >
    <AMSongsItem
      v-for="(entry, i) in visibleUpNext"
      :key="entry.id"
      :song="entry.entry"
      :reorder-id="entry.id"
      @play="queueStore.playIndex(i + overshoot)"
    />
    <OMTableStatus v-if="upNext.length > queueStore.maxDisplayedSongs">
      <div class="flex items-center gap-2">
        <OMIcon name="lucide:layout-grid" class="size-4" filled />
        <span
          >{{ upNext.length - queueStore.maxDisplayedSongs }} more
          {{ upNext.length - queueStore.maxDisplayedSongs === 1 ? "song" : "songs" }}</span
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

const overshoot = computed(() => (queueStore.index ?? -1) + 1);
const upNext = computed(() => queueStore.currentQueue.slice(overshoot.value));
const visibleUpNext = computed(() => upNext.value.slice(0, queueStore.maxDisplayedSongs));
</script>
