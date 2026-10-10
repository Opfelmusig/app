import type { SongColumns } from "#layers/amdata/app/types/songs";

export const tableColumnsKey: InjectionKey<ComputedRef<SongColumns[]>> = Symbol("table-columns");

export type ColumnItem<T> = { label: string; value: T };

export const defaultSongColumns: SongColumns[] = ["album", "artist", "length"];

export const songColumns: ColumnItem<SongColumns>[] = [
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Genre", value: "genre" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];
