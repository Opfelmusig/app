import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { parseCatalogPlaylist } from "#layers/amdata/app/lib/parsers/playlists";
import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogPlaylistsScopes, catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchCatalogPlaylist(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.playlists.get(id, {
    scopes: catalogPlaylistsScopes,
  });

  const playlist = response.data[0];
  if (!hasResourceName(playlist)) return null;

  return parseCatalogPlaylist(playlist);
}

export async function fetchCatalogPlaylistTracks(client: OpfelMusigClient, id: string) {
  const tracks = await collect(
    client.catalog.playlists.iterateRelationship(id, "tracks", {
      limit: 100,
      scopes: catalogSongsScopes,
    }),
  );

  const songs = tracks
    .filter((track) => track.type === "songs")
    .filter(hasResourceName)
    .map(parseCatalogSong);

  return createListResources(songs, `playlists:${id}`);
}
