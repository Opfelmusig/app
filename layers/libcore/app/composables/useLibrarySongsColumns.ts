import type { SongColumns } from "#layers/libcore/app/components/Library/Songs.vue";
import type { DbListId } from "#layers/libcore/app/database/types";

const defaultColumns: SongColumns[] = ["album", "artist", "length"];

export default function useLibrarySongsColumns(id: MaybeRefOrGetter<DbListId>) {
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

  function reset() {
    columns.value = [...defaultColumns];
  }

  return {
    columns,
    options,
    reset,
  };
}
