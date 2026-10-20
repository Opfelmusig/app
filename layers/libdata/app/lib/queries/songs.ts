import { collect } from "@opfelmusig/lib/helpers";

import { parseLibrarySong } from "#layers/amdata/app/lib/parsers/songs";
import { librarySongsScopes } from "#layers/libdata/app/lib/scopes/library";

export async function fetchLibrarySongs(signal: AbortSignal) {
  const client = useClient();

  const songs = await collect(
    client.library.songs.iterateAll({
      limit: 100,
      scopes: librarySongsScopes,
      sort: "-dateAdded",
      config: { signal },
    }),
    { signal },
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
