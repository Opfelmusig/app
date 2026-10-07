import type { SongColumns } from "#layers/amdata/app/types/songs";
import type { DbListIdentifier } from "#layers/libcore/app/database/types";

const defaultColumns: SongColumns[] = ["album", "artist", "length"];

export default function useLibrarySongsColumns(id: MaybeRefOrGetter<DbListIdentifier>) {
  const columns = useLocalStorage<SongColumns[]>(
    () => `opfelmusig:song-columns:${toValue(id)}`,
    [...defaultColumns],
  );

  const options: { label: string; value: SongColumns }[] = [
    { label: "Album", value: "album" },
    { label: "Artist", value: "artist" },
    { label: "Genre", value: "genre" },
    { label: "Year", value: "year" },
    { label: "Length", value: "length" },
  ];

  const columnsChanged = computed(
    () =>
      columns.value.length !== defaultColumns.length ||
      defaultColumns.some((column) => !columns.value.includes(column)),
  );

  function reset() {
    columns.value = [...defaultColumns];
  }

  return {
    columns,
    columnsChanged,
    options,
    reset,
  };
}
