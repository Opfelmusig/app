import { collect } from "@opfelmusig/lib/helpers";

import { parseCatalogSong, parseLibrarySong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";
import { librarySongsScopes } from "#layers/amdata/app/lib/scopes/library";

export async function fetchCatalogSong(id: string) {
  const client = useClient();

  const response = await client.catalog.songs.get(id, {
    scopes: catalogSongsScopes,
  });

  const song = response.data[0];
  if (!hasResourceName(song)) return null;

  return parseCatalogSong(song);
}

export async function fetchCatalogSongLyrics(id: string) {
  const client = useClient();

  const response = await client.catalog.songs.getRelationship(id, "lyrics");

  const lyrics = response.data[0]?.attributes?.ttml;

  return lyrics ? parseAppleMusicLyricsTtml(lyrics) : undefined;
}

export async function fetchLibrarySongs() {
  const client = useClient();

  const songs = await collect(
    client.library.songs.iterateAll({
      limit: 100,
      scopes: librarySongsScopes,
      sort: "-dateAdded",
    }),
  );

  return songs.filter(hasResourceName).map(parseLibrarySong);
}

export async function fetchLibrarySong(id: string) {
  const client = useClient();

  const response = await client.library.songs.get(id, {
    scopes: librarySongsScopes,
  });

  const song = response.data[0];
  if (!hasResourceName(song)) return null;

  return parseLibrarySong(song);
}
