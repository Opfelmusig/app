import type { ContentRating } from "@opfelmusig/lib/types";

import type { SongFilterRating } from "#layers/amdata/app/types/songs";

export default function useSongFilters() {
  const selectedRatings = ref<SongFilterRating[]>([]);
  const selectedContentRatings = ref<ContentRating[]>([]);
  const inLibrary = ref(false);
  const isUploaded = ref(false);

  const changed = computed(
    () =>
      selectedRatings.value.length > 0 ||
      selectedContentRatings.value.length > 0 ||
      inLibrary.value ||
      isUploaded.value,
  );

  function reset() {
    selectedRatings.value = [];
    selectedContentRatings.value = [];
    inLibrary.value = false;
    isUploaded.value = false;
  }

  const filters = computed<SongFilters>(() => ({
    personalRating: selectedRatings.value,
    contentRating: selectedContentRatings.value,
    inLibrary: inLibrary.value,
    isUploaded: isUploaded.value,
  }));

  return {
    filters,
    selectedRatings,
    selectedContentRatings,
    inLibrary,
    isUploaded,
    changed,
    reset,
  };
}
