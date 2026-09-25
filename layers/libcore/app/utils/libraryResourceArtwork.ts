import type { ResolvedResource } from "#layers/libcore/app/database/types";

export default function (resource?: ResolvedResource | null) {
  switch (resource?.type) {
    case "artist":
    case "song":
    case "playlist":
    case "album":
      return resource.item.artwork;
  }

  return;
}
