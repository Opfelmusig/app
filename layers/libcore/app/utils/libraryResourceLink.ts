import type { ResolvedDbResource } from "#layers/libcore/app/database/types";

export default function (resource?: ResolvedDbResource | null) {
  if (!resource) return;

  switch (resource.type) {
    case "library-songs":
      return `/resources/library-albums/${resource.item.albumId}?song_id=${resource.item.id}`;
    default:
      return `/resources/${resource.type}/${resource.item.id}`;
  }
}
