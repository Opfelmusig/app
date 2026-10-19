import type { OpfelMusigClient } from "@opfelmusig/lib";
import { isNotResourceType } from "@opfelmusig/lib/helpers";

import { parseResource } from "#layers/amdata/app/lib/parsers";
import {
  librarySongsScopes,
  libraryAlbumsScopes,
  libraryArtistsScopes,
  libraryPlaylistsScopes,
} from "#layers/amdata/app/lib/scopes/library";

export async function fetchLibraryPins(client: OpfelMusigClient) {
  const pins = await client.library.getPins({
    scopes: {
      ...librarySongsScopes,
      ...libraryAlbumsScopes,
      ...libraryArtistsScopes,
      ...libraryPlaylistsScopes,
    },
  });

  return createListResources(
    pins.data
      .filter((resource) => isNotResourceType(resource, "library-music-videos"))
      .filter(hasResourceName)
      .map((resource) => parseResource(resource)),
    "pins",
  );
}
