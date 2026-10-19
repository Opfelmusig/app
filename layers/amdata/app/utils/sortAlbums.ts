import { sort as sortWith, sortBy } from "remeda";

import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";

export default function sortAlbums(
  albums: AmAlbum[],
  sort: AlbumSort,
  dir: SortingDirection,
): AmAlbum[] {
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
      return dir === "asc" ? [...albums] : albums.toReversed();
    case "title":
    case "artist": {
      const field = sort === "title" ? "name" : "artistName";
      return sortWith(albums, (a, b) => compare(a.attributes[field], b.attributes[field]));
    }
    case "year":
      return sortBy(albums, [(album) => year(album.attributes.releaseDate), dir]);
  }
}
