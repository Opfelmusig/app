import type { AlbumSort } from "#layers/amdata/app/types/albums";
import type { SongSort } from "#layers/amdata/app/types/songs";

export type SortingItem<T> = { label: string; value: T };
export type SortingDirection = "asc" | "desc";

export const songSortingBase: SortingItem<SongSort>[] = [
  { label: "Title", value: "title" },
  { label: "Artist", value: "artist" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];

export const defaultSongSorting: SortingItem<SongSort>[] = [
  {
    label: "Default",
    value: "default",
  },
  { label: "Album", value: "album" },
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
  { label: "Album", value: "album" },
  ...songSortingBase,
];

export const albumSortingBase: SortingItem<AlbumSort>[] = [
  { label: "Title", value: "title" },
  { label: "Year", value: "year" },
];

export const defaultAlbumSorting: SortingItem<AlbumSort>[] = [
  {
    label: "Default",
    value: "default",
  },
  { label: "Artist", value: "artist" },
  ...albumSortingBase,
];

export const artistAlbumSorting: SortingItem<AlbumSort>[] = [
  {
    label: "Default",
    value: "default",
  },
  ...albumSortingBase,
];

export const libraryAlbumSorting: SortingItem<AlbumSort>[] = [
  {
    label: "Date Added",
    value: "default",
  },
  { label: "Artist", value: "artist" },
  ...albumSortingBase,
];
