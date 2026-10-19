import { collect } from "@opfelmusig/lib/helpers";

import { parseLibraryArtist } from "#layers/amdata/app/lib/parsers/artists";
import { libraryArtistsScopes } from "#layers/libdata/app/lib/scopes/library";

export async function fetchLibraryArtists() {
  const client = useClient();

  const artists = await collect(
    client.library.artists.iterateAll({
      limit: 100,
      scopes: libraryArtistsScopes,
    }),
  );

  return artists.filter(hasResourceName).map(parseLibraryArtist);
}

export async function fetchLibraryArtist(id: string) {
  const client = useClient();

  const response = await client.library.artists.get(id, {
    scopes: libraryArtistsScopes,
  });

  const artist = response.data[0];
  if (!hasResourceName(artist)) return null;

  return parseLibraryArtist(artist);
}
