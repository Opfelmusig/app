import { sort as sortWith, sortBy } from "remeda";

import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";

export default function sortSongs(
  songs: AmSong[],
  sort: SongSort,
  dir: SortingDirection,
): AmSong[] {
  const direction = dir === "asc" ? 1 : -1;

  function compare(left: string = "", right: string = "") {
    if (left === right) return 0;

    return left.toLowerCase().trim().localeCompare(right.toLowerCase().trim()) * direction;
  }

  function year(date: string | undefined) {
    return date && /^\d{4}(?:-|$)/.test(date) && Number.isFinite(Date.parse(date))
      ? Number(date.slice(0, 4))
      : 0;
  }

  switch (sort) {
    case "default":
      return dir === "asc" ? [...songs] : songs.toReversed();
    case "discAndTrackNumber":
      return sortBy(
        songs,
        [(song) => song.attributes.discNumber ?? 0, dir],
        [(song) => song.attributes.trackNumber ?? 0, dir],
      );
    case "title":
    case "artist":
    case "album": {
      const field = sort === "title" ? "name" : sort === "artist" ? "artistName" : "albumName";
      return sortWith(songs, (a, b) => compare(a.attributes[field], b.attributes[field]));
    }
    case "year":
      return sortBy(songs, [(song) => year(song.attributes.releaseDate), dir]);
    case "length":
      return sortBy(songs, [(song) => song.attributes.durationInMillis, dir]);
  }
}
