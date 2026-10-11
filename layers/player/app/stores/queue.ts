import type {
  CreateQueue,
  CreateQueueContext,
  QueueContext,
  QueueEntry,
  QueueTrack,
} from "~~/layers/player/app/types/queue";

export const useQueueStore = defineStore("opfelmusig:queue-store", () => {
  const queue = ref<QueueEntry[]>([]);
  const context = ref<QueueContext | null>(null);
  const contextQueue = ref<QueueEntry[]>([]);
  const index = ref<number | null>(null);
  const isLooping = ref<boolean>(true);
  const isShuffeling = ref<boolean>(false);

  const combinedLength = computed(() => queue.value.length + contextQueue.value.length);
  const inContext = computed(
    () =>
      index.value !== null &&
      index.value >= queue.value.length &&
      index.value < combinedLength.value,
  );
  const contextIndex = computed(() => {
    if (index.value === null) return null;

    const contextIndex = index.value - queue.value.length;
    if (inContext.value && contextIndex >= 0) return contextIndex;
    else return null;
  });

  function loop() {
    if (isLooping.value && combinedLength.value > 0) index.value = 0;
    else index.value = null;
  }

  function createQueueFromTracks(tracks: QueueTrack[]): QueueEntry[] {
    return tracks.map((track, i) => ({
      id: crypto.randomUUID(),
      position: i,
      entry: track,
    }));
  }

  function playContext(createContext: CreateQueueContext) {
    queue.value = [];
    contextQueue.value = [];

    context.value = createContext.context;
    contextQueue.value = createQueueFromTracks(createContext.tracks);

    if (contextQueue.value.length === 0) {
      index.value = null;
    } else if (createContext.index >= 0 && createContext.index < contextQueue.value.length) {
      index.value = createContext.index;
    } else {
      index.value = 0;
    }
  }

  function playQueue(createQueue: CreateQueue) {
    queue.value = [];
    contextQueue.value = [];
    context.value = null;

    queue.value = createQueueFromTracks(createQueue.tracks);

    if (queue.value.length === 0) {
      index.value = null;
    } else if (createQueue.index >= 0 && createQueue.index < queue.value.length) {
      index.value = createQueue.index;
    } else {
      index.value = 0;
    }
  }

  function playStation(_station: unknown) {
    // set context
    // fetch next song
    // if "next" fetch next song
  }
  function playNext(_track: QueueTrack) {
    // if in context split context at index and put before to queue and after back in context
  }
  function append(_track: QueueTrack) {
    // only if in queue and there already is a track
  }

  function next() {
    if (combinedLength.value === 0) index.value = null;
    else if (index.value !== null) {
      index.value += 1;
      if (index.value >= combinedLength.value) loop();
    } else index.value = 0;
  }

  function previous() {
    if (index.value === null || combinedLength.value <= 0) return;

    index.value -= 1;

    if (index.value < 0 && isLooping.value) index.value = combinedLength.value - 1;
    else if (index.value < 0) index.value = 0;
  }

  function clearQueue() {
    // clear queue after index
  }

  function clearContext() {
    // clear context after index
    // move the rest to queue
    // discard context if needed
  }

  function playIndex(_index: number) {
    // jump to index
  }

  const current = computed(() => {
    if (index.value === null || !Number.isInteger(index.value)) return null;

    if (!inContext.value) return queue.value[index.value] ?? null;

    if (contextIndex.value === null) return null;
    else return contextQueue.value[contextIndex.value] ?? null;
  });

  return {
    queue: computed(() => shallowReadonly(queue.value)),
    contextQueue: computed(() => shallowReadonly(contextQueue.value)),
    context: shallowReadonly(context),
    contextIndex,
    index: readonly(index),
    current,
    inContext,
    playContext,
    playQueue,
    playStation,
    next,
    previous,
    clearQueue,
    clearContext,
    playNext,
    append,
    jumpToIndex: playIndex,
    isLooping,
    isShuffeling,
  };
});
