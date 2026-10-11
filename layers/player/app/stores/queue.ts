import type {
  CreateQueueContext,
  QueueContext,
  QueueEntry,
  QueueTrack,
} from "~~/layers/player/app/types/queue";

export const useQueueStore = defineStore("opfelmusig:queue-store", () => {
  const queue = ref<QueueEntry[]>([]);
  const context = ref<QueueContext | null>(null);
  const contextQueue = ref<QueueEntry[]>([]);
  const shuffledQueue = ref<QueueEntry[]>([]);
  const index = ref<number | null>(null);
  const isLooping = ref<boolean>(true);
  const isShuffeling = ref<boolean>(false);

  const combinedLength = computed(() => queue.value.length + contextQueue.value.length);
  const inContext = computed(
    () =>
      !isShuffeling.value &&
      index.value !== null &&
      index.value >= queue.value.length &&
      index.value < combinedLength.value,
  );
  const contextIndex = computed(() => {
    if (index.value === null || isShuffeling.value) return null;

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

  function playContext(createContext: CreateQueueContext, shouldShuffle: boolean = false) {
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

    if (shouldShuffle) shuffle();
    else resetShuffle();
  }

  function playStation(_station: unknown) {
    // set context
    // fetch next song
    // if "next" fetch next song
  }
  function playNext(_tracks: QueueTrack[]) {
    // if in context split context at index and put before to queue and after back in context
  }
  function playAfter(_tracks: QueueTrack[]) {
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
  function playIndex(_index: number) {}
  function deleteIndex(_index: number) {}
  function moveIndex(_index: number, _newIndex: number) {}

  function shuffleList(entries: QueueEntry[]): QueueEntry[] {
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j]!, entries[i]!];
    }

    return entries;
  }

  function shuffle() {
    const entries = [...queue.value, ...contextQueue.value];
    const start = index.value === null ? 0 : index.value + 1;

    shuffledQueue.value = [...entries.slice(0, start), ...shuffleList(entries.slice(start))];

    isShuffeling.value = true;
  }

  function unshuffle() {
    const id = current.value?.id;

    const queueIndex = queue.value.findIndex((entry) => entry.id === id);
    const contextIndex = contextQueue.value.findIndex((entry) => entry.id === id);

    if (queueIndex >= 0) {
      index.value = queueIndex;
    } else if (contextIndex >= 0) {
      index.value = queue.value.length + contextIndex;
    } else {
      index.value = null;
    }

    resetShuffle();
  }

  function resetShuffle() {
    isShuffeling.value = false;
    shuffledQueue.value = [];
  }

  function toggleShuffle() {
    if (isShuffeling.value) unshuffle();
    else shuffle();
  }

  const current = computed(() => {
    if (index.value === null || !Number.isInteger(index.value)) return null;

    if (isShuffeling.value) return shuffledQueue.value[index.value] ?? null;

    if (!inContext.value) return queue.value[index.value] ?? null;

    if (contextIndex.value === null) return null;
    else return contextQueue.value[contextIndex.value] ?? null;
  });

  return {
    queue: computed(() => shallowReadonly(queue.value)),
    contextQueue: computed(() => shallowReadonly(contextQueue.value)),
    shuffledQueue: computed(() => shallowReadonly(shuffledQueue.value)),
    context: shallowReadonly(context),
    contextIndex,
    index: readonly(index),
    current,
    inContext,
    playContext,
    playStation,
    next,
    previous,
    clearQueue,
    clearContext,
    playNext,
    playAfter,
    playIndex,
    deleteIndex,
    moveIndex,
    isLooping,
    isShuffeling: readonly(isShuffeling),
    toggleShuffle,
  };
});
