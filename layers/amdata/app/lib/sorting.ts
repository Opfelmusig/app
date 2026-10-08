import type { SongSort } from "#layers/amdata/app/types/songs";

export type SortingItem<T> = { label: string; value: T };
export type SortingDirection = "asc" | "desc";

export const SongSortingBase: SortingItem<SongSort>[] = [
  { label: "Title", value: "title" },
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Genre", value: "genre" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];

export const DefaultSongSorting: SortingItem<SongSort>[] = [
  {
    label: "Default",
    value: "default",
  },
  ...SongSortingBase,
];

export const AlbumSongSorting: SortingItem<SongSort>[] = [
  {
    label: "Album order",
    value: "discAndTrackNumber",
  },
  ...SongSortingBase,
];

export const LibrarySongSorting: SortingItem<SongSort>[] = [
  {
    label: "Date Added",
    value: "default",
  },
  ...SongSortingBase,
];
