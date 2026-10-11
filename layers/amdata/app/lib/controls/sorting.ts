import type { ControlOption } from "#layers/amdata/app/lib/controls/types";
import type { AlbumSort } from "#layers/amdata/app/types/albums";
import type { SongSort } from "#layers/amdata/app/types/songs";

export type SortingDirection = "asc" | "desc";

export const songSortingBase: ControlOption<SongSort>[] = [
  { label: "Title", value: "title" },
  { label: "Artist", value: "artist" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];

export const defaultSongSorting: ControlOption<SongSort>[] = [
  { label: "Default", value: "default" },
  { label: "Album", value: "album" },
  ...songSortingBase,
];

export const albumSongSorting: ControlOption<SongSort>[] = [
  { label: "Album order", value: "discAndTrackNumber" },
  ...songSortingBase,
];

export const librarySongSorting: ControlOption<SongSort>[] = [
  { label: "Date added", value: "default" },
  { label: "Album", value: "album" },
  ...songSortingBase,
];

export const albumSortingBase: ControlOption<AlbumSort>[] = [
  { label: "Title", value: "title" },
  { label: "Year", value: "year" },
];

export const defaultAlbumSorting: ControlOption<AlbumSort>[] = [
  { label: "Default", value: "default" },
  { label: "Artist", value: "artist" },
  ...albumSortingBase,
];

export const artistAlbumSorting: ControlOption<AlbumSort>[] = [
  { label: "Default", value: "default" },
  ...albumSortingBase,
];

export const libraryAlbumSorting: ControlOption<AlbumSort>[] = [
  { label: "Date added", value: "default" },
  { label: "Artist", value: "artist" },
  ...albumSortingBase,
];
