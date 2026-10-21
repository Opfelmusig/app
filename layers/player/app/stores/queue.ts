import type { RatingValue } from "@opfelmusig/lib/types";
import { shuffle as shuffleList } from "remeda";
import type {
  CreateQueueContext,
  QueueContext,
  QueueEntry,
} from "~~/layers/player/app/types/queue";

export const useQueueStore = defineStore(
  "opfelmusig:queue-store:v2",
  () => {
    const toast = useToast();
    const log = logger.withTag("queue");

    const maxDisplayedSongs = 50;

    const queue = ref<QueueEntry[]>([]);
    const context = ref<QueueContext | null>(null);
    const contextQueue = ref<QueueEntry[]>([]);
    const shuffledQueue = ref<QueueEntry[]>([]);
    const index = ref<number | null>(null);
    const isLooping = ref(true);
    const isShuffling = ref(false);
    const requestedStation = ref<AmCatalogStation | null>(null);
    let pendingStationEntry: string | undefined;

    const isStation = computed(() => context.value?.type === "stations");

    const inContext = computed(
      () =>
        !isShuffling.value &&
        index.value !== null &&
        index.value >= queue.value.length &&
        index.value < currentCount.value,
    );
    const contextIndex = computed(() => {
      if (index.value === null || isShuffling.value) return null;

      const contextIndex = index.value - queue.value.length;
      if (inContext.value && contextIndex >= 0) return contextIndex;
      else return null;
    });

    function findPlayableIndex(start: number, direction = 1): number | null {
      const entries = isShuffling.value
        ? shuffledQueue.value
        : [...queue.value, ...contextQueue.value];

      const playable = entries.flatMap((entry, i) =>
        entry.entry.attributes.playParams ? [i] : [],
      );
      const target =
        direction === 1 ? playable.find((i) => i >= start) : playable.findLast((i) => i <= start);

      if (target !== undefined) return target;
      if (!isLooping.value || isStation.value) return null;
      return (direction === 1 ? playable[0] : playable.at(-1)) ?? null;
    }

    function createQueueFromTrack(track: AmSong, fromContext = false): QueueEntry {
      return {
        id: crypto.randomUUID(),
        fromContext,
        entry: track,
      };
    }

    function createQueueFromTracks(tracks: AmSong[], fromContext = false): QueueEntry[] {
      return tracks.map((track) => createQueueFromTrack(track, fromContext));
    }

    function updateRating(id: string, rating: RatingValue | null) {
      for (const { entry } of [...queue.value, ...contextQueue.value, ...shuffledQueue.value]) {
        const counterpartId =
          entry.type === "songs" ? entry.extras.libraryId : entry.extras.catalogId;
        if (entry.id !== id && counterpartId !== id) continue;

        if (rating === null) delete entry.attributes.personalRating;
        else entry.attributes.personalRating = rating;
      }
    }

    function play(track: AmSong) {
      requestedStation.value = null;
      contextQueue.value = [];
      index.value = null;
      context.value = null;
      resetShuffle();

      queue.value = [createQueueFromTrack(track)];
      index.value = findPlayableIndex(0);
    }

    function playContext(createContext: CreateQueueContext, shouldShuffle: boolean = false) {
      requestedStation.value = null;
      queue.value = [];
      index.value = null;

      context.value = createContext.context;
      contextQueue.value = createQueueFromTracks(createContext.tracks, true);

      if (shouldShuffle) shuffle();
      else resetShuffle();

      const start =
        createContext.index >= 0 && createContext.index < contextQueue.value.length
          ? createContext.index
          : 0;
      index.value = findPlayableIndex(start);
    }

    async function playStation(station: AmCatalogStation) {
      requestedStation.value = station;

      try {
        const songs = await getTracks(station, 2);

        if (requestedStation.value?.id !== station.id) {
          return;
        }

        playContext(
          {
            context: station,
            index: 0,
            tracks: songs,
          },
          false,
        );
      } catch (cause) {
        if (requestedStation.value?.id !== station.id) return;

        log.error("Failed to fetch station tracks", { cause });
        toast.add({ title: "Unable to play station", description: String(cause), color: "error" });
      }

      requestedStation.value = null;
    }

    function clear() {
      requestedStation.value = null;
      pendingStationEntry = undefined;
      index.value = null;
      queue.value = [];
      context.value = null;
      contextQueue.value = [];
      resetShuffle();
    }

    function playNext(tracks: AmSong[]) {
      if (tracks.length === 0) return;

      const entries = createQueueFromTracks(tracks);

      if (!current.value) {
        const start = isShuffling.value ? shuffledQueue.value.length : queue.value.length;
        queue.value.push(...entries);
        if (isShuffling.value) shuffledQueue.value.push(...entries);
        index.value = findPlayableIndex(start);
        return;
      }

      const currentId = current.value?.id;
      const currentContextIndex = contextQueue.value.findIndex((entry) => entry.id === currentId);
      if (currentContextIndex >= 0) {
        queue.value.push(...contextQueue.value.splice(0, currentContextIndex + 1));
      }

      const currentQueueIndex = queue.value.findIndex((entry) => entry.id === currentId);
      queue.value.splice(currentQueueIndex + 1, 0, ...entries);
      if (isShuffling.value) shuffledQueue.value.splice(index.value! + 1, 0, ...entries);
    }

    function playAfter(tracks: AmSong[]) {
      if (!current.value || inContext.value || queue.value.length === 0) return;

      const entries = createQueueFromTracks(tracks);
      queue.value.push(...entries);
      if (isShuffling.value) shuffledQueue.value.push(...entries);
    }

    function next() {
      const nextIndex = findPlayableIndex((index.value ?? -1) + 1);
      if (isStation.value && nextIndex === null && current.value) return;
      index.value = nextIndex;
    }

    function previous() {
      if (index.value === null) return;
      index.value = findPlayableIndex(index.value - 1, -1) ?? findPlayableIndex(0);
    }

    function clearQueue() {
      if (isShuffling.value) {
        shuffledQueue.value.splice((index.value ?? -1) + 1);
      } else if (!inContext.value) {
        queue.value.splice((index.value ?? -1) + 1);
      }
    }

    function clearContext() {
      if (!inContext.value) {
        context.value = null;
        contextQueue.value = [];
        return;
      }

      contextQueue.value.splice((contextIndex.value ?? -1) + 1);
    }

    function findEntryIndex(id: string) {
      const entries = isShuffling.value
        ? shuffledQueue.value
        : [...queue.value, ...contextQueue.value];
      return entries.findIndex((entry) => entry.id === id);
    }

    function playEntry(id: string) {
      const nextIndex = findEntryIndex(id);
      if (nextIndex < 0) return;

      index.value = findPlayableIndex(nextIndex);
    }

    function deleteEntry(id: string) {
      const targetIndex = findEntryIndex(id);
      if (targetIndex < 0) return;
      if (index.value !== null && targetIndex <= index.value) return;

      queue.value = queue.value.filter((entry) => entry.id !== id);
      contextQueue.value = contextQueue.value.filter((entry) => entry.id !== id);
      shuffledQueue.value = shuffledQueue.value.filter((entry) => entry.id !== id);
    }

    function moveEntry(id: string, targetId: string, placement: "before" | "after") {
      const entries = isShuffling.value
        ? shuffledQueue.value
        : queue.value.some((entry) => entry.id === id)
          ? queue.value
          : contextQueue.value;
      const fromIndex = entries.findIndex((entry) => entry.id === id);
      const targetIndex = entries.findIndex((entry) => entry.id === targetId);
      if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return;

      const offset = !isShuffling.value && entries === contextQueue.value ? queue.value.length : 0;
      if (
        index.value !== null &&
        (fromIndex + offset <= index.value || targetIndex + offset <= index.value)
      ) {
        return;
      }

      const toIndex =
        targetIndex + (placement === "after" ? 1 : 0) - (fromIndex < targetIndex ? 1 : 0);
      if (fromIndex === toIndex) return;

      const [entry] = entries.splice(fromIndex, 1);
      if (entry) entries.splice(toIndex, 0, entry);
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

    watch(
      () =>
        isStation.value && findPlayableIndex((index.value ?? -1) + 1) === null
          ? current.value?.id
          : undefined,
      async (id) => {
        const station = context.value;
        if (!id || station?.type !== "stations") return;
        if (pendingStationEntry && findEntryIndex(pendingStationEntry) >= 0) return;

        pendingStationEntry = id;
        try {
          const songs = await getTracks(station);
          if (context.value !== station || findEntryIndex(id) < 0) return;

          contextQueue.value.push(...createQueueFromTracks(songs, true));
        } catch (cause) {
          if (context.value !== station || findEntryIndex(id) < 0) return;

          log.error("Failed to fetch next station song", { cause });
          toast.add({
            title: "Unable to load next song",
            description: String(cause),
            color: "error",
          });
        } finally {
          if (pendingStationEntry === id) pendingStationEntry = undefined;
        }
      },
      { immediate: true },
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
      play,
      playContext,
      playStation,
      next,
      previous,
      clear,
      clearQueue,
      clearContext,
      playNext,
      playAfter,
      playEntry,
      updateRating,
      deleteEntry,
      moveEntry,
      isLooping,
      isShuffling,
      toggleShuffle,
      maxDisplayedSongs,
      currentCount,
      requestedStation,
      isStation,
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
