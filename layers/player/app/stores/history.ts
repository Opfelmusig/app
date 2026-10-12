import type { QueueTrack } from "#layers/player/app/types/queue";

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
      const previous = entries.value.filter(
        ({ track: saved }) =>
          saved.resource.type !== track.resource.type || saved.resource.id !== track.resource.id,
      );
      entries.value = [
        { id: crypto.randomUUID(), playedAt: new Date().toISOString(), track },
        ...previous,
      ].slice(0, 500);
    }

    function clear() {
      entries.value = [];
    }

    return { entries, record, clear };
  },
  { persist: true },
);
