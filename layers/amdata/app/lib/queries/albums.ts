import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { parseCatalogAlbum } from "#layers/amdata/app/lib/parsers/albums";
import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogAlbumsScopes, catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchCatalogAlbum(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.albums.get(id, {
    scopes: catalogAlbumsScopes,
  });

  const album = response.data[0];
  if (!hasResourceName(album)) return null;

  return parseCatalogAlbum(album);
}

export async function fetchCatalogAlbumTracks(client: OpfelMusigClient, id: string) {
  const tracks = await collect(
    client.catalog.albums.iterateRelationship(id, "tracks", {
      limit: 100,
      scopes: catalogSongsScopes,
    }),
  );

  const songs = tracks
    .filter((track) => track.type === "songs")
    .filter(hasResourceName)
    .map(parseCatalogSong);

  return createListResources(songs, `albums:${id}`);
}
