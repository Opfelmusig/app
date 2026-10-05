import type { DbListId } from "#layers/libcore/app/database/types";
import type { LibrarySongsSort } from "#layers/libcore/app/utils/sortLibrarySongs";

const defaultSort: LibrarySongsSort = { by: "library", direction: "asc" };

export default function useLibrarySongsSorting(id: MaybeRefOrGetter<DbListId>) {
  const sort = useLocalStorage<LibrarySongsSort>(() => `opfelmusig:song-sorting:${toValue(id)}`, {
    ...defaultSort,
  });

  const options: { label: string; value: LibrarySongsSort["by"] }[] = [
    { label: "Date Added", value: "library" },
    { label: "Title", value: "title" },
    { label: "Album", value: "album" },
    { label: "Artist", value: "artist" },
    { label: "Genre", value: "genre" },
    { label: "Year", value: "year" },
    { label: "Length", value: "length" },
  ];

  const sortChanged = computed(
    () => sort.value.by !== defaultSort.by || sort.value.direction !== defaultSort.direction,
  );

  function reset() {
    sort.value = { ...defaultSort };
  }

  return { sort, sortChanged, options, reset };
}
