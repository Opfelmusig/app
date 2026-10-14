import { sort as sortWith, sortBy } from "remeda";

import type { SortingDirection } from "#layers/amdata/app/lib/controls/sorting";

export default function sortAlbums(
  albums: AmListResource<AmAlbum>[],
  sort: AlbumSort,
  dir: SortingDirection,
): AmListResource<AmAlbum>[] {
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
      return sortBy(albums, [(album) => album.position, dir]);
    case "title":
    case "artist": {
      const field = sort === "title" ? "name" : "artistName";
      return sortWith(albums, (a, b) =>
        compare(a.resource.attributes[field], b.resource.attributes[field]),
      );
    }
    case "year":
      return sortBy(albums, [(album) => year(album.resource.attributes.releaseDate), dir]);
  }
}
