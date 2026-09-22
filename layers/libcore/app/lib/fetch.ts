import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { prepareAppleMusicLibrary } from "#layers/libcore/app/lib/prepare";
import {
  albumsScopes,
  artistsScopes,
  emptyScopes,
  playlistsScopes,
  songsScopes,
  type AlbumsScopes,
  type ArtistsScopes,
  type EmptyScopes,
  type PlaylistFoldersScopes,
  type PlaylistsScopes,
  type SongsScopes,
} from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  const target = createEmptyLibrary();

  const library = await getAllLibraryPages(client, signal, progress);

  prepareAppleMusicLibrary(target, library);

  // Album tracks
  // Playlist tracks
  // Artist albums

  return target;
}

function createEmptyLibrary(): AppleMusicLibrary {
  return {
    resources: [],
    lists: [],
    listResources: [],
    songs: [],
    albums: [],
    artists: [],
    playlists: [],
    folders: [],
    libraryCatalogLinks: [],
  };
}

export interface LibraryPages {
  songs: SongsScopes[];
  albums: AlbumsScopes[];
  artists: ArtistsScopes[];
  playlists: PlaylistsScopes[];
  pins: EmptyScopes[];
  tree: PlaylistFoldersScopes[];
}

function getAllLibraryPages(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<LibraryPages> {
  return Promise.allKeyed({
    songs: collect(
      client.library.songs.iterateAll({ limit: 100, scopes: songsScopes, config: { signal } }),
      {
        signal,
        onItem: () => {
          progress.songs++;
        },
      },
    ),
    albums: collect(
      client.library.albums.iterateAll({ limit: 100, scopes: albumsScopes, config: { signal } }),
      {
        signal,
        onItem: () => {
          progress.albums++;
        },
      },
    ),
    artists: collect(
      client.library.artists.iterateAll({ limit: 100, scopes: artistsScopes, config: { signal } }),
      {
        signal,
        onItem: () => {
          progress.artists++;
        },
      },
    ),
    playlists: collect(
      client.library.playlists.iterateAll({
        limit: 100,
        scopes: playlistsScopes,
        config: { signal },
      }),
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
