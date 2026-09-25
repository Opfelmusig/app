import type { ResolvedResource } from "#layers/libcore/app/database/types";

export default function (resource?: ResolvedResource | null) {
  if (!resource) return;

  switch (resource.type) {
    case "song":
      return `/resources/library-albums/${resource.item.albumId}?song_id=${resource.item.id}`;
    default:
      return `/resources/library-${resource.type}s/${resource.item.id}`;
  }
}
