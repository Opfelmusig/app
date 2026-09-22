import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect, isResourceType } from "@opfelmusig/lib/helpers";

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

  const pages = await fetchAllLibraryPages(client, signal, progress);
  const resourcePages = await fetchAllLibraryResourcePages(client, signal, pages);

  prepareAppleMusicLibrary(target, pages, resourcePages);

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
      .getPins({ scopes: emptyScopes, config: { signal } })
      .then((response) => response.data),
    tree: collect(client.library.playlistFolders.iterateTree({ config: { signal } }), { signal }),
  });
}

export interface LibraryResourcePages {
  albums: Record<string, SongsScopes[]>;
  artists: Record<string, AlbumsScopes[]>;
  playlists: Record<string, SongsScopes[]>;
}

function fetchAllLibraryResourcePages(
  client: OpfelMusigClient,
  signal: AbortSignal,
  pages: LibraryPages,
): Promise<LibraryResourcePages> {
  return Promise.allKeyed({
    albums: Promise.allKeyed(
      Object.fromEntries(
        pages.albums.map((album) => [
          album.id,
          collect(
            client.library.albums.iterateRelationship(album.id, "tracks", {
              limit: 100,
              scopes: songsScopes,
              config: { signal },
            }),
            { signal },
          ).then((tracks) => tracks.filter((track) => isResourceType(track, "library-songs"))),
        ]),
      ),
    ),
    artists: Promise.allKeyed(
      Object.fromEntries(
        pages.artists.map((artist) => [
          artist.id,
          collect(
            client.library.artists.iterateRelationship(artist.id, "albums", {
              limit: 100,
              scopes: albumsScopes,
              config: { signal },
            }),
            { signal },
          ),
        ]),
      ),
    ),
    playlists: Promise.allKeyed(
      Object.fromEntries(
        pages.playlists.map((playlist) => [
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
    ),
  });
}
