import type { OpfelMusigClient } from "@opfelmusig/lib";

import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchCatalogSong(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.songs.get(id, {
    scopes: catalogSongsScopes,
  });

  const song = response.data[0];
  if (!hasResourceName(song)) return null;

  return parseCatalogSong(song);
}

export async function fetchCatalogSongLyrics(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.songs.getRelationship(id, "lyrics");

  const lyrics = response.data[0]?.attributes?.ttml;

  return lyrics ? parseAppleMusicLyricsTtml(lyrics) : undefined;
}
