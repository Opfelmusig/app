import type { ControlOption } from "#layers/amdata/app/lib/controls/types";

export const defaultSongColumns: SongColumns[] = ["album", "artist", "length"];

export const songColumns: ControlOption<SongColumns>[] = [
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Genre", value: "genre" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];
