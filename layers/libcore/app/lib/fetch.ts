/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpfelMusigClient } from "@opfelmusig/lib";
import type * as Library from "#layers/libcore/app/database/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";
import { collect } from "#layers/libcore/app/lib/helpers";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";
import { emptyScopes, scopes } from "#layers/libcore/app/lib/scopes";

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  const dbResources: Library.Resource[] = [];
  const dbLists: Library.List[] = [];
  const dbListResources: Library.ListResource[] = [];

  const dbSongs: Library.Song[] = [];
  const dbAlbums: Library.Album[] = [];
  const dbArtists: Library.Artist[] = [];
  const dbPlaylists: Library.Playlist[] = [];
  const dbFolders: Library.Folder[] = [];

  const dbLibraryCatalogLinks: Library.LibraryCatalogLink[] = [];

  const [songs, albums, artists, playlists, pins, tree] = await Promise.all([
    collect(client.library.songs.iterateAll({ limit: 100, scopes }), () => {
      progress.songs++;
    }),
    collect(client.library.albums.iterateAll({ limit: 100, scopes }), () => {
      progress.albums++;
    }),
    collect(client.library.artists.iterateAll({ limit: 100, scopes }), () => {
      progress.artists++;
    }),
    collect(client.library.playlists.iterateAll({ limit: 100, scopes }), () => {
      progress.playlists++;
    }),
    client.library.getPins({ scopes: emptyScopes }).then((response) => response.data),
    collect(client.library.playlistFolders.iterateTree()),
  ]);

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
