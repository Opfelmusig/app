import { shuffle as shuffleList } from "remeda";
import type {
  CreateQueueContext,
  QueueContext,
  QueueEntry,
  QueueTrack,
} from "~~/layers/player/app/types/queue";

export const useQueueStore = defineStore(
  "opfelmusig:queue-store",
  () => {
    const maxDisplayedSongs = 50;

    const queue = ref<QueueEntry[]>([]);
    const context = ref<QueueContext | null>(null);
    const contextQueue = ref<QueueEntry[]>([]);
    const shuffledQueue = ref<QueueEntry[]>([]);
    const index = ref<number | null>(null);
    const isLooping = ref<boolean>(true);
    const isShuffling = ref<boolean>(false);

    const combinedLength = computed(() => queue.value.length + contextQueue.value.length);
    const inContext = computed(
      () =>
        !isShuffling.value &&
        index.value !== null &&
        index.value >= queue.value.length &&
        index.value < combinedLength.value,
    );
    const contextIndex = computed(() => {
      if (index.value === null || isShuffling.value) return null;

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
      index.value = null;

      context.value = createContext.context;
      contextQueue.value = createQueueFromTracks(createContext.tracks);

      if (shouldShuffle) shuffle();
      else resetShuffle();

      if (contextQueue.value.length === 0) {
        index.value = null;
      } else if (createContext.index >= 0 && createContext.index < contextQueue.value.length) {
        index.value = createContext.index;
      } else {
        index.value = 0;
      }
    }

    function playStation(_station: AmCatalogStation) {
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

    function clearQueue() {}
    function clearContext() {}

    function playIndex(nextIndex: number) {
      if (nextIndex < 0 || nextIndex >= combinedLength.value) return;

      index.value = nextIndex;
    }

    function deleteIndex(targetIndex: number) {
      if (index.value !== null && targetIndex <= index.value) return;

      const entries = isShuffling.value
        ? shuffledQueue.value
        : [...queue.value, ...contextQueue.value];

      const id = entries[targetIndex]?.id;

      queue.value = queue.value.filter((entry) => entry.id !== id);
      contextQueue.value = contextQueue.value.filter((entry) => entry.id !== id);
      shuffledQueue.value = shuffledQueue.value.filter((entry) => entry.id !== id);
    }

    function moveIndex(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex) return;

      if (index.value !== null && (fromIndex <= index.value || toIndex <= index.value)) return;

      if (isShuffling.value) {
        const [entry] = shuffledQueue.value.splice(fromIndex, 1);
        shuffledQueue.value.splice(toIndex, 0, entry!);
        return;
      }

      const queueLength = queue.value.length;
      const fromQueue = fromIndex < queueLength;
      const toQueue = toIndex < queueLength;

      const source = fromQueue ? queue.value : contextQueue.value;
      const sourceIndex = fromQueue ? fromIndex : fromIndex - queueLength;
      const [entry] = source.splice(sourceIndex, 1);

      const target = toQueue ? queue.value : contextQueue.value;
      const targetIndex = toQueue ? toIndex : toIndex - queue.value.length;

      if (entry) target.splice(targetIndex, 0, entry);
    }

    function shuffle() {
      const entries = [...queue.value, ...contextQueue.value];
      const start = index.value === null ? 0 : index.value + 1;

      shuffledQueue.value = [...entries.slice(0, start), ...shuffleList(entries.slice(start))];

      isShuffling.value = true;
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
      isShuffling.value = false;
      shuffledQueue.value = [];
    }

    function toggleShuffle() {
      if (isShuffling.value) unshuffle();
      else shuffle();
    }

    const current = computed(() => {
      if (index.value === null) return null;

      if (isShuffling.value) return shuffledQueue.value[index.value] ?? null;

      if (!inContext.value) return queue.value[index.value] ?? null;

      if (contextIndex.value === null) return null;
      else return contextQueue.value[contextIndex.value] ?? null;
    });

    const currentQueue = computed(() => {
      if (isShuffling.value) return shuffledQueue.value;
      else return queue.value;
    });

    const currentCount = computed(() =>
      isShuffling.value
        ? shuffledQueue.value.length
        : currentQueue.value.length + contextQueue.value.length,
    );

    return {
      queue,
      currentQueue,
      contextQueue,
      shuffledQueue,
      context,
      contextIndex,
      index,
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
      isShuffling,
      toggleShuffle,
      maxDisplayedSongs,
      currentCount,
    };
  },
  {
    persist: {
      pick: [
        "index",
        "context",
        "isLooping",
        "isShuffling",
        "contextQueue",
        "queue",
        "shuffledQueue",
      ],
    },
  },
);
