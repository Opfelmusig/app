import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { parseCatalogArtist } from "#layers/amdata/app/lib/parsers/artists";
import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogArtistsScopes, catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchCatalogArtist(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.artists.get(id, {
    scopes: catalogArtistsScopes,
  });

  const artist = response.data[0];
  if (!hasResourceName(artist)) return null;

  return parseCatalogArtist(artist);
}

export async function fetchCatalogArtistTopSongs(client: OpfelMusigClient, id: string) {
  const songs = await collect(
    client.catalog.artists.iterateView(id, "top-songs", {
      limit: 100,
      scopes: catalogSongsScopes,
    }),
  );

  return createListResources(
    songs.filter(hasResourceName).map(parseCatalogSong),
    `artists:${id}:top-songs`,
  );
}
