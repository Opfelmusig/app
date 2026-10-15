import type { OpfelMusigClient } from "@opfelmusig/lib";

import { parseCatalogAlbum } from "#layers/amdata/app/lib/parsers/albums";
import { parseCatalogArtist } from "#layers/amdata/app/lib/parsers/artists";
import { parseCatalogPlaylist } from "#layers/amdata/app/lib/parsers/playlists";
import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import {
  catalogAlbumsScopes,
  catalogArtistsScopes,
  catalogPlaylistsScopes,
  catalogSongsScopes,
} from "#layers/amdata/app/lib/scopes/catalog";

export const searchFilters = ["all", "songs", "albums", "artists", "playlists"] as const;
export type SearchFilter = (typeof searchFilters)[number];

export async function fetchCatalogSearch(
  client: OpfelMusigClient,
  term: string,
  filter: SearchFilter,
) {
  const response = await client.catalog.search(term, {
    shape: {
      types: filter === "all" ? ["songs", "albums", "artists", "playlists"] : [filter],
    },
    limit: filter === "all" ? 6 : 50,
    scopes: {
      ...catalogSongsScopes,
      ...catalogAlbumsScopes,
      ...catalogArtistsScopes,
      ...catalogPlaylistsScopes,
    },
  });

  return {
    songs: createListResources(
      (response.results.song?.data ?? []).filter(hasResourceName).map(parseCatalogSong),
      `search:${term}:songs`,
    ),
    albums: createListResources(
      (response.results.album?.data ?? []).filter(hasResourceName).map(parseCatalogAlbum),
      `search:${term}:albums`,
    ),
    artists: createListResources(
      (response.results.artist?.data ?? []).filter(hasResourceName).map(parseCatalogArtist),
      `search:${term}:artists`,
    ),
    playlists: createListResources(
      (response.results.playlist?.data ?? []).filter(hasResourceName).map(parseCatalogPlaylist),
      `search:${term}:playlists`,
    ),
  };
}
