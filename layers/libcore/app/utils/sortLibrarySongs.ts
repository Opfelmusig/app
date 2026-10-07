import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmLibrarySong } from "#layers/amdata/app/types/songs";

export interface LibrarySongsSort {
  by: "library" | "title" | "artist" | "album" | "genre" | "year" | "length";
  direction: "asc" | "desc";
}

export default function sortLibrarySongs(
  songs: readonly AmListResource<AmLibrarySong>[],
  sort: LibrarySongsSort,
): AmListResource<AmLibrarySong>[] {
  const direction = sort.direction === "asc" ? 1 : -1;

  function compare(left: string = "", right: string = "") {
    if (left === right) return 0;

    return left.toLowerCase().trim().localeCompare(right.toLowerCase().trim()) * direction;
  }

  function year(date: string | undefined) {
    return date && /^\d{4}(?:-|$)/.test(date) && Number.isFinite(Date.parse(date))
      ? Number(date.slice(0, 4))
      : 0;
  }

  return songs.toSorted((a, b) => {
    const left = a.resource.attributes;
    const right = b.resource.attributes;

    switch (sort.by) {
      case "library":
        return (a.position - b.position) * direction;
      case "title":
        return compare(left.name, right.name);
      case "artist":
        return compare(left.artistName, right.artistName);
      case "album":
        return compare(left.albumName, right.albumName);
      case "genre":
        return compare(left.genreNames.join(", "), right.genreNames.join(", "));
      case "year":
        return (year(left.releaseDate) - year(right.releaseDate)) * direction;
      case "length":
        return (left.durationInMillis - right.durationInMillis) * direction;
    }
  });
}
