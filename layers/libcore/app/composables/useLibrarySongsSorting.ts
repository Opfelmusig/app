import type { SongSorting } from "#layers/amdata/app/types/songs";
import type { DbListIdentifier } from "#layers/libcore/app/database/types";

export default function useLibrarySongsSorting(id: MaybeRefOrGetter<DbListIdentifier>) {
  const sortBy = useLocalStorage<SongSorting>(
    () => `opfelmusig:song-sorting:${toValue(id)}`,
    "default",
  );

  const direction = useLocalStorage<SortingDirection>(
    () => `opfelmusig:song-sorting:${toValue(id)}:direction`,
    "asc",
  );

  const options: { label: string; value: SongSorting }[] = [
    { label: "Default", value: "default" },
    { label: "Title", value: "title" },
    { label: "Album", value: "album" },
    { label: "Artist", value: "artist" },
    { label: "Genre", value: "genre" },
    { label: "Year", value: "year" },
    { label: "Length", value: "length" },
  ];

  const sortChanged = computed(() => sortBy.value !== "default" || direction.value !== "asc");

  function reset() {
    sortBy.value = "default";
    direction.value = "asc";
  }

  return { sortBy, direction, sortChanged, options, reset };
}
