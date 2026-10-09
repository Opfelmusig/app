import type { SortingDirection } from "#layers/amdata/app/lib/sorting";
import type { AlbumSort, AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmListResource } from "#layers/amdata/app/types/resources";

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

  return albums.toSorted((a, b) => {
    const left = a.resource.attributes;
    const right = b.resource.attributes;

    switch (sort) {
      case "default":
        return (a.position - b.position) * direction;
      case "title":
        return compare(left.name, right.name);
      case "artist":
        return compare(left.artistName, right.artistName);
      case "year":
        return (year(left.releaseDate) - year(right.releaseDate)) * direction;
    }
  });
}
