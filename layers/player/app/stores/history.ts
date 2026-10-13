import { pipe, take, uniqueBy } from "remeda";

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
      entries.value = pipe(
        [{ id: crypto.randomUUID(), playedAt: new Date().toISOString(), track }, ...entries.value],
        uniqueBy(({ track }) => `${track.resource.type}:${track.resource.id}`),
        take(500),
      );
    }

    function clear() {
      entries.value = [];
    }

    return { entries, record, clear };
  },
  { persist: true },
);
