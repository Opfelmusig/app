import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import {
  libraryAlbumsScopes,
  libraryArtistsScopes,
  librarySongsScopes,
  type LibraryAlbumsScopes,
  type LibraryArtistsScopes,
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
  prepareAppleMusicLibrary(target, pages);

  return target;
}

export interface LibraryPages {
  songs: LibrarySongsScopes[];
  albums: LibraryAlbumsScopes[];
  artists: LibraryArtistsScopes[];
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
    ).then((resources) => {
      progress.songs.done = true;
      return resources.filter(hasResourceName);
    }),
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
  });
}
