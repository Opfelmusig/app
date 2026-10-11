import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongSort } from "#layers/amdata/app/types/songs";

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

  return songs.toSorted((a, b) => {
    const left = a.resource.attributes;
    const right = b.resource.attributes;

    switch (sort) {
      case "default":
        return (a.position - b.position) * direction;
      case "discAndTrackNumber": {
        const disc = (left.discNumber ?? 0) - (right.discNumber ?? 0);
        const track = (left.trackNumber ?? 0) - (right.trackNumber ?? 0);

        return (disc || track) * direction;
      }
      case "title":
        return compare(left.name, right.name);
      case "artist":
        return compare(left.artistName, right.artistName);
      case "album":
        return compare(left.albumName, right.albumName);
      case "year":
        return (year(left.releaseDate) - year(right.releaseDate)) * direction;
      case "length":
        return (left.durationInMillis - right.durationInMillis) * direction;
    }
  });
}
