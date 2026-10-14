import { sort as sortWith, sortBy } from "remeda";

import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";

export default function sortSongs(
  songs: AmListResource<AmSong>[],
  sort: SongSort,
  dir: SortingDirection,
): AmListResource<AmSong>[] {
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
      return sortBy(songs, [(song) => song.position, dir]);
    case "discAndTrackNumber":
      return sortBy(
        songs,
        [(song) => song.resource.attributes.discNumber ?? 0, dir],
        [(song) => song.resource.attributes.trackNumber ?? 0, dir],
      );
    case "title":
    case "artist":
    case "album": {
      const field = sort === "title" ? "name" : sort === "artist" ? "artistName" : "albumName";
      return sortWith(songs, (a, b) =>
        compare(a.resource.attributes[field], b.resource.attributes[field]),
      );
    }
    case "year":
      return sortBy(songs, [(song) => year(song.resource.attributes.releaseDate), dir]);
    case "length":
      return sortBy(songs, [(song) => song.resource.attributes.durationInMillis, dir]);
  }
}
