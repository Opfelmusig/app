<template>
  <div class="z-10 flex size-full flex-col overflow-hidden overflow-y-auto border-t border-default">
    <template v-if="queueStore.currentQueue.length > 0">
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
    <template v-if="!queueStore.isShuffling && queueStore.contextQueue.length > 0">
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
              {{
                upNextContext.length - queueStore.maxDisplayedSongs === 1 ? "song" : "songs"
              }}</span
            >
          </div>
        </OMTableStatus>
      </AMSongsWrapper>
    </template>
    <div
      v-if="
        (queueStore.currentQueue.length <= 0 || !queueStore.isShuffling) &&
        queueStore.contextQueue.length <= 0
      "
      class="flex size-full items-center justify-center text-muted"
    >
      Nothing in the queue
    </div>
    <AMFooter v-if="queueStore.currentCount > 0 && queueStore.isLooping">
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="lucide:repeat" class="size-3.5" />
        Repeating songs
      </div>
    </AMFooter>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();

function reorder({ fromIndex, toIndex }: TableReorder, offset: number) {
  queueStore.moveIndex(fromIndex + offset, toIndex + offset);
}

const overshoot = computed(() => (queueStore.index ?? -1) + 1);
const upNext = computed(() => queueStore.currentQueue.slice(overshoot.value));
const visibleUpNext = computed(() => upNext.value.slice(0, queueStore.maxDisplayedSongs));

const contextStart = computed(() => (queueStore.contextIndex ?? -1) + 1);
const upNextContext = computed(() => queueStore.contextQueue.slice(contextStart.value));
const visibleUpNextContext = computed(() =>
  upNextContext.value.slice(0, queueStore.maxDisplayedSongs),
);
const overshootContext = computed(() => queueStore.queue.length + contextStart.value);
</script>
