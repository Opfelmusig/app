import type { DbResource } from "#layers/libcore/app/database/types";

export default function (resource?: DbResource | null) {
  switch (resource?.type) {
    case "library-artists":
    case "library-songs":
    case "library-playlists":
    case "library-albums":
      return resource.attributes.artwork;
  }

  return;
}
