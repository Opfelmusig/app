import type { DbResource } from "#layers/libcore/app/database/types";

export default function (resource?: DbResource | null) {
  if (!resource) return;

  switch (resource.type) {
    case "library-songs":
      return `/resources/library-albums/${resource.attributes.albumId}?song_id=${resource.id}`;
    case "library-artists":
      return `/library/artists/${resource.id}`;
    default:
      return `/resources/${resource.type}/${resource.id}`;
  }
}
