/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineScopes, type OpfelMusigClient } from "@opfelmusig/lib";
import type * as Library from "#layers/libcore/app/database/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

export interface AppleMusicLibrary {
  resources: Library.Resource[];
  lists: Library.List[];
  listResources: Library.ListResource[];

  songs: Library.Song[];
  albums: Library.Album[];
  artists: Library.Artist[];
  playlists: Library.Playlist[];
  folders: Library.Folder[];

  libraryCatalogLinks: Library.LibraryCatalogLink[];
}

async function collect<T>(iterator: AsyncIterable<T>, onItem?: (item: T) => void): Promise<T[]> {
  const result: T[] = [];

  for await (const item of iterator) {
    result.push(item);
    onItem?.(item);
  }

  return result;
}

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  progress.songs = 0;
  progress.albums = 0;
  progress.artists = 0;
  progress.playlists = 0;

  const [songs, albums, artists, playlists, recentlyAdded, pins] = await Promise.all([
    collect(client.library.songs.iterateAll({ limit: 100 }), () => {
      progress.songs++;
    }),
    collect(client.library.albums.iterateAll({ limit: 100 }), () => {
      progress.albums++;
    }),
    collect(client.library.artists.iterateAll({ limit: 100 }), () => {
      progress.artists++;
    }),
    collect(client.library.playlists.iterateAll({ limit: 100 }), () => {
      progress.playlists++;
    }),
    collect(client.library.iterateRecentlyAdded({ limit: 25 })),
    client.library.getPins({ limit: 100 }).then((response) => response.data),
  ]);

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
