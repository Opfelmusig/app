import type { ResolvedResource } from "#layers/libcore/app/database/types";

export default function (resource?: ResolvedResource | null) {
  switch (resource?.type) {
    case "library-artists":
    case "library-songs":
    case "library-playlists":
    case "library-albums":
      return resource.item.artwork;
  }

  return;
}
