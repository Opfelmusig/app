import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect, isNotResourceType, isResourceType } from "@opfelmusig/lib/helpers";

import { prepareAppleMusicLibrary } from "#layers/libcore/app/lib/prepare";
import {
  albumsScopes,
  artistsScopes,
  pinsScopes,
  playlistsScopes,
  songsScopes,
  type AlbumsScopes,
  type ArtistsScopes,
  type PinsScopes,
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

  const pages = await fetchAllLibraryPages(client, signal, progress);
  const playlistTracks = await fetchPlaylistTracks(client, signal, pages.playlists);

  prepareAppleMusicLibrary(target, pages, playlistTracks);

  return target;
}

function createEmptyLibrary(): AppleMusicLibrary {
  return {
    resources: new Map(),
    lists: new Map(),
    listResources: new Map(),
    songs: new Map(),
    albums: new Map(),
    artists: new Map(),
    playlists: new Map(),
    folders: new Map(),
    libraryCatalogLinks: new Map(),
  };
}

export interface LibraryPages {
  songs: SongsScopes[];
  albums: AlbumsScopes[];
  artists: ArtistsScopes[];
  playlists: PlaylistsScopes[];
  pins: PinsScopes[];
  playlistFolders: PlaylistFoldersScopes[];
}

function fetchAllLibraryPages(
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
      .getPins({ scopes: pinsScopes, config: { signal } })
      .then((response) =>
        response.data.filter((resource) => isNotResourceType(resource, "library-music-videos")),
      ),
    playlistFolders: collect(client.library.playlistFolders.iterateTree({ config: { signal } }), {
      signal,
    }),
  });
}

function fetchPlaylistTracks(
  client: OpfelMusigClient,
  signal: AbortSignal,
  playlists: PlaylistsScopes[],
): Promise<Record<string, SongsScopes[]>> {
  return Promise.allKeyed(
    Object.fromEntries(
      playlists.map((playlist) => [
        playlist.id,
        collect(
          client.library.playlists.iterateRelationship(playlist.id, "tracks", {
            limit: 100,
            scopes: songsScopes,
            config: { signal },
          }),
          { signal },
        ).then((tracks) => tracks.filter((track) => isResourceType(track, "library-songs"))),
      ]),
    ),
  );
}
