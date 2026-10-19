import { collect } from "@opfelmusig/lib/helpers";

import { parseLibraryPlaylist } from "#layers/amdata/app/lib/parsers/playlists";
import { parseLibrarySong } from "#layers/amdata/app/lib/parsers/songs";
import { libraryPlaylistsScopes, librarySongsScopes } from "#layers/libdata/app/lib/scopes/library";

export async function fetchLibraryPlaylists() {
  const client = useClient();

  const playlists = await collect(
    client.library.playlists.iterateAll({
      limit: 100,
      scopes: libraryPlaylistsScopes,
    }),
  );

  return playlists.filter(hasResourceName).map(parseLibraryPlaylist);
}

export async function fetchLibraryPlaylist(id: string) {
  const client = useClient();

  const response = await client.library.playlists.get(id, {
    scopes: libraryPlaylistsScopes,
  });

  const playlist = response.data[0];
  if (!hasResourceName(playlist)) return null;

  return parseLibraryPlaylist(playlist);
}

export async function fetchLibraryPlaylistTracks(id: string) {
  const client = useClient();

  const tracks = await collect(
    client.library.playlists.iterateRelationship(id, "tracks", {
      limit: 100,
      scopes: librarySongsScopes,
    }),
  );

  const songs = tracks
    .filter((track) => track.type === "library-songs")
    .filter(hasResourceName)
    .map(parseLibrarySong);

  return songs;
}
