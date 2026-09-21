/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpfelMusigClient } from "@opfelmusig/lib";
import type {
  DbAlbum,
  DbArtist,
  DbFolder,
  DbLibraryCatalogLink,
  DbList,
  DbListResource,
  DbPlaylist,
  DbResource,
  DbSong,
} from "#layers/libcore/app/database/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";
import { emptyScopes, scopes } from "#layers/libcore/app/lib/scopes";
import { collect } from "@opfelmusig/lib/helpers";

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  const dbResources: DbResource[] = [];
  const dbLists: DbList[] = [];
  const dbListResources: DbListResource[] = [];

  const dbSongs: DbSong[] = [];
  const dbAlbums: DbAlbum[] = [];
  const dbArtists: DbArtist[] = [];
  const dbPlaylists: DbPlaylist[] = [];
  const dbFolders: DbFolder[] = [];

  const dbLibraryCatalogLinks: DbLibraryCatalogLink[] = [];

  const library = await getAllLibraryPages(client, signal, progress);

  // Album tracks
  // Playlist tracks
  // Artist albums

  return {
    resources: dbResources,
    lists: dbLists,
    listResources: dbListResources,
    songs: dbSongs,
    albums: dbAlbums,
    artists: dbArtists,
    playlists: dbPlaylists,
    folders: dbFolders,
    libraryCatalogLinks: dbLibraryCatalogLinks,
  };
}

function getAllLibraryPages(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
) {
  return Promise.allKeyed({
    songs: collect(client.library.songs.iterateAll({ limit: 100, scopes, config: { signal } }), {
      signal,
      onItem: () => {
        progress.songs++;
      },
    }),
    albums: collect(client.library.albums.iterateAll({ limit: 100, scopes, config: { signal } }), {
      signal,
      onItem: () => {
        progress.albums++;
      },
    }),
    artists: collect(
      client.library.artists.iterateAll({ limit: 100, scopes, config: { signal } }),
      {
        signal,
        onItem: () => {
          progress.artists++;
        },
      },
    ),
    playlists: collect(
      client.library.playlists.iterateAll({ limit: 100, scopes, config: { signal } }),
      {
        signal,
        onItem: () => {
          progress.playlists++;
        },
      },
    ),
    pins: client.library
      .getPins({ scopes: emptyScopes, config: { signal } })
      .then((response) => response.data),
    tree: collect(client.library.playlistFolders.iterateTree({ config: { signal } }), { signal }),
  });
}
