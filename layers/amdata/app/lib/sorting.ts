import type { SongSort } from "#layers/amdata/app/types/songs";

export type SortingItem<T> = { label: string; value: T };
export type SortingDirection = "asc" | "desc";

export const songSortingBase: SortingItem<SongSort>[] = [
  { label: "Title", value: "title" },
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];

export const defaultSongSorting: SortingItem<SongSort>[] = [
  {
    label: "Default",
    value: "default",
  },
  ...songSortingBase,
];

export const albumSongSorting: SortingItem<SongSort>[] = [
  {
    label: "Album order",
    value: "discAndTrackNumber",
  },
  ...songSortingBase,
];

export const librarySongSorting: SortingItem<SongSort>[] = [
  {
    label: "Date Added",
    value: "default",
  },
  ...songSortingBase,
];
