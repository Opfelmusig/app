import { collect } from "@opfelmusig/lib/helpers";

import { parseLibraryPlaylistFolder } from "#layers/amdata/app/lib/parsers/folders";
import { libraryFoldersScopes } from "#layers/libdata/app/lib/scopes/library";

export async function fetchLibraryFolders(signal: AbortSignal) {
  const client = useClient();

  const playlists = await collect(
    client.library.playlistFolders.iterateFolders({ config: { signal } }),
    { signal },
  );

  return playlists.filter(hasResourceName).map(parseLibraryPlaylistFolder);
}

export async function fetchLibraryFolder(id: string) {
  const client = useClient();

  const response = await client.library.playlistFolders.get(id, {
    scopes: libraryFoldersScopes,
  });

  const folder = response.data[0];
  if (!hasResourceName(folder)) return;

  return parseLibraryPlaylistFolder(folder);
}
