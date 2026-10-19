import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect, isResourceType } from "@opfelmusig/lib/helpers";
import { pullObject } from "remeda";

import {
  libraryAlbumsScopes,
  libraryArtistsScopes,
  libraryPlaylistsScopes,
  librarySongsScopes,
  type LibraryAlbumsScopes,
  type LibraryArtistsScopes,
  type LibraryPlaylistFoldersScopes,
  type LibraryPlaylistsScopes,
  type LibrarySongsScopes,
} from "#layers/amdata/app/lib/scopes/library";
import { prepareAppleMusicLibrary } from "#layers/libcore/app/lib/prepare";
import { createEmptyLibrary } from "#layers/libcore/app/lib/prepare/helpers";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  const target = createEmptyLibrary();

  const pages = await fetchAllLibraryPages(client, signal, progress);
  const playlistTracks = await fetchPlaylistTracks(client, signal, pages, progress);

  progress.songs.done = true;

  prepareAppleMusicLibrary(target, pages, playlistTracks);

  return target;
}

export interface LibraryPages {
  songs: LibrarySongsScopes[];
  albums: LibraryAlbumsScopes[];
  artists: LibraryArtistsScopes[];
  playlists: LibraryPlaylistsScopes[];
  playlistFolders: LibraryPlaylistFoldersScopes[];
}

function fetchAllLibraryPages(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<LibraryPages> {
  return Promise.allKeyed({
    songs: collect(
      client.library.songs.iterateAll({
        limit: 100,
        scopes: librarySongsScopes,
        sort: "-dateAdded",
        config: { signal },
      }),
      {
        signal,
        onItem: () => {
          progress.songs.count++;
        },
      },
    ).then((resources) => resources.filter(hasResourceName)),
    albums: collect(
      client.library.albums.iterateAll({
        limit: 100,
        scopes: libraryAlbumsScopes,
        sort: "-dateAdded",
        config: { signal },
      }),
      {
        signal,
        onItem: () => {
          progress.albums.count++;
        },
      },
    ).then((result) => {
      progress.albums.done = true;
      return result.filter(hasResourceName);
    }),
    artists: collect(
      client.library.artists.iterateAll({
        limit: 100,
        scopes: libraryArtistsScopes,
        config: { signal },
      }),
      {
        signal,
        onItem: () => {
          progress.artists.count++;
        },
      },
    ).then((result) => {
      progress.artists.done = true;
      return result.filter(hasResourceName);
    }),
    playlists: collect(
      client.library.playlists.iterateAll({
        limit: 100,
        scopes: libraryPlaylistsScopes,
        config: { signal },
      }),
      {
        signal,
        onItem: () => {
          progress.playlists.count++;
        },
      },
    ).then((result) => {
      progress.playlists.done = true;
      return result.filter(hasResourceName);
    }),
    playlistFolders: collect(
      client.library.playlistFolders.iterateFolders({ config: { signal } }),
      {
        signal,
      },
    ).then((resources) => resources.filter(hasResourceName)),
  });
}

function fetchPlaylistTracks(
  client: OpfelMusigClient,
  signal: AbortSignal,
  pages: LibraryPages,
  progress: LibraryProgress,
): Promise<Record<string, LibrarySongsScopes[]>> {
  const seenSongIds = new Set(pages.songs.map((song) => song.id));

  return Promise.allKeyed(
    pullObject(
      pages.playlists,
      (playlist) => playlist.id,
      (playlist) =>
        collect(
          client.library.playlists.iterateRelationship(playlist.id, "tracks", {
            limit: 100,
            scopes: librarySongsScopes,
            config: { signal },
          }),
          {
            signal,
            onItem: (item) => {
              if (isResourceType(item, "library-songs") && !seenSongIds.has(item.id)) {
                seenSongIds.add(item.id);
                progress.songs.count++;
              }
            },
          },
        ).then((tracks) =>
          tracks.filter((track) => isResourceType(track, "library-songs")).filter(hasResourceName),
        ),
    ),
  );
}
