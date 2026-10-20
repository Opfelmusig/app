import type { RatingValue } from "@opfelmusig/lib/types";
import { pipe, take, uniqueWith } from "remeda";

export interface HistoryEntry {
  id: string;
  playedAt: string;
  track: AmSong;
}

export const useHistoryStore = defineStore(
  "opfelmusig:history-store",
  () => {
    const entries = ref<HistoryEntry[]>([]);

    function record(track: AmSong) {
      entries.value = pipe(
        [{ id: crypto.randomUUID(), playedAt: new Date().toISOString(), track }, ...entries.value],
        uniqueWith(({ track: left }, { track: right }) => {
          const leftIds = [
            left.id,
            left.type === "songs" ? left.extras.libraryId : left.extras.catalogId,
          ];
          const rightIds = [
            right.id,
            right.type === "songs" ? right.extras.libraryId : right.extras.catalogId,
          ];

          return leftIds.some((id) => id !== undefined && rightIds.includes(id));
        }),
        take(500),
      );
    }

    function updateRating(id: string, rating: RatingValue | null) {
      for (const { track } of entries.value) {
        const counterpartId =
          track.type === "songs" ? track.extras.libraryId : track.extras.catalogId;
        if (track.id !== id && counterpartId !== id) continue;

        if (rating === null) delete track.attributes.personalRating;
        else track.attributes.personalRating = rating;
      }
    }

    function clear() {
      entries.value = [];
    }

    function deleteEntry(id: string) {
      entries.value = entries.value.filter((entry) => entry.id !== id);
    }

    return { entries, record, updateRating, clear, deleteEntry };
  },
  { persist: true },
);
