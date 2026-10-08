import type { ContentRating } from "@opfelmusig/lib/types";

import type { SongFilterRating } from "#layers/amdata/app/types/songs";

export default function useSongFilters() {
  const selectedRatings = ref<SongFilterRating[]>([]);
  const selectedContentRatings = ref<ContentRating[]>([]);
  const inLibrary = ref(false);

  const changed = computed(
    () =>
      selectedRatings.value.length > 0 ||
      selectedContentRatings.value.length > 0 ||
      inLibrary.value,
  );

  function reset() {
    selectedRatings.value = [];
    selectedContentRatings.value = [];
    inLibrary.value = false;
  }

  return { selectedRatings, selectedContentRatings, inLibrary, changed, reset };
}
