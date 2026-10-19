import { pipe, take, uniqueBy } from "remeda";

export interface HistoryEntry {
  id: string;
  playedAt: string;
  track: QueueTrack;
}

export const useHistoryStore = defineStore(
  "opfelmusig:history-store",
  () => {
    const entries = ref<HistoryEntry[]>([]);

    function record(track: QueueTrack) {
      entries.value = pipe(
        [{ id: crypto.randomUUID(), playedAt: new Date().toISOString(), track }, ...entries.value],
        uniqueBy(({ track }) => track.resource.id),
        take(500),
      );
    }

    function clear() {
      entries.value = [];
    }

    function deleteEntry(id: string) {
      entries.value = entries.value.filter((entry) => entry.id !== id);
    }

    return { entries, record, clear, deleteEntry };
  },
  { persist: true },
);
