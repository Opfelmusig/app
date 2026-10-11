<template>
  <div
    ref="_el"
    class="fixed top-9.25 right-0 bottom-14.25 z-50 shrink-0 overflow-hidden pl-4 transition-transform select-none"
    :style="{ width: `${size + 16}px` }"
  >
    <div
      class="absolute inset-y-2 left-0 w-2 cursor-ew-resize touch-none"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
      @dblclick="onDoubleClick"
    />
    <div
      class="flex h-full w-full flex-col overflow-hidden overflow-y-auto border-l border-default bg-default shadow-xl"
    >
      <template v-if="currentQueue.length > 0">
        <PanelHeader
          v-if="queueStore.context && queueStore.isShuffeling"
          title="Continue Playing"
          :context="queueStore.context"
        />
        <AMSongsWrapper :columns="[]">
          <AMSongs :songs="visibleUpNext" @play="(i) => queueStore.playIndex(i + overshoot)" />
          <OMTableStatus v-if="upNext.length > maxSongs">
            <div class="flex items-center gap-2">
              <OMIcon name="lucide:layout-grid" class="size-4" filled />
              <span>{{ upNext.length - maxSongs }} more songs</span>
            </div>
          </OMTableStatus>
        </AMSongsWrapper>
      </template>
      <template v-if="!queueStore.isShuffeling && queueStore.contextQueue.length > 0">
        <USeparator class="first:hidden" />
        <PanelHeader title="Continue Playing" :context="queueStore.context" />
        <AMSongsWrapper :columns="[]">
          <AMSongs
            :songs="visibleUpNextContext"
            @play="(i) => queueStore.playIndex(i + overshootContext)"
          />
          <OMTableStatus v-if="upNextContext.length > maxSongs">
            <div class="flex items-center gap-2">
              <OMIcon name="lucide:layout-grid" class="size-4" filled />
              <span>{{ upNextContext.length - maxSongs }} more songs</span>
            </div>
          </OMTableStatus>
        </AMSongsWrapper>
      </template>
      <div
        v-if="
          (currentQueue.length <= 0 || !queueStore.isShuffeling) &&
          queueStore.contextQueue.length <= 0
        "
        class="flex size-full items-center justify-center text-muted"
      >
        Nothing in the queue
      </div>
      <AMFooter v-if="count > 0 && queueStore.isLooping">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="lucide:repeat" class="size-3.5" />
          Repeating songs
        </div>
      </AMFooter>
    </div>
  </div>
</template>

<script lang="ts" setup>
const {
  el: _el,
  size,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
} = useResizable("opfelmusig:player-sidebar", {
  side: "right",
  unit: "px",
  minSize: 300,
  maxSize: 512,
  defaultSize: 448,
  collapsible: false,
  storage: "local",
});

const queueStore = useQueueStore();
const maxSongs = 50;

const currentQueue = computed(() => {
  if (queueStore.isShuffeling) return queueStore.shuffledQueue.map((e) => e.entry);
  else return queueStore.queue.map((e) => e.entry);
});

const overshoot = computed(() => (queueStore.index ?? -1) + 1);
const upNext = computed(() => currentQueue.value.slice(overshoot.value));
const visibleUpNext = computed(() => upNext.value.slice(0, maxSongs));

const contextStart = computed(() => (queueStore.contextIndex ?? -1) + 1);
const upNextContext = computed(() =>
  queueStore.contextQueue.slice(contextStart.value).map((e) => e.entry),
);
const visibleUpNextContext = computed(() => upNextContext.value.slice(0, maxSongs));
const overshootContext = computed(() => queueStore.queue.length + contextStart.value);

const count = computed(
  () => currentQueue.value.length + (queueStore.isShuffeling ? 0 : queueStore.contextQueue.length),
);
</script>
