import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { DbListId } from "#layers/libcore/app/database/types";
import type { DbSong } from "#layers/libcore/app/database/types";
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

  target.lists.push({
    id: DbListId.Songs,
  });

  library.songs.forEach((song, index) => {
    const parsed = parseSong(song);

    target.songs.push(parsed);
    target.resources.push({
      id: parsed.id,
      type: "song",
    });
    target.listResources.push({
      id: `${song.id}-${DbListId.Songs}-${index}`,
      resource_id: song.id,
      list_id: DbListId.Songs,
      position: index,
    });

    const catalog = song.relationships?.catalog.data[0];

    if (!catalog) return;

    const album = catalog.relationships?.albums.data[0];

    if (album && catalog.attributes?.albumName) {
      target.libraryCatalogLinks.push({
        id: `${parsed.id}-album`,
        catalog_id: album.id,
        type: "album",
        name: catalog.attributes.albumName,
        position: 0,
        resource_id: parsed.id,
      });
    }

    const artists = catalog.relationships?.artists.data;

    artists?.forEach((artist, index) => {
      if (!artist.attributes) return;

      target.libraryCatalogLinks.push({
        id: `${parsed.id}-artist-${artist.id}-${index}`,
        catalog_id: artist.id,
        type: "artist",
        name: artist.attributes.name,
        position: index,
        resource_id: parsed.id,
      });
    });
  });

  // Album tracks
  // Playlist tracks
  // Artist albums

  return target;
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

type LibraryPage<TKey extends keyof LibraryPages> = LibraryPages[TKey][number];

function parseSong(song: LibraryPage<"songs">): DbSong {
  const catalog = song.relationships?.catalog.data[0];
  const album = song.relationships?.albums.data[0];
  const artist = song.relationships?.artists.data[0];
  const attributes = song.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${song.id}: missing attributes`);

  return {
    id: song.id,
    name: attributes.name,
    trackNumber: attributes.trackNumber,
    albumName: attributes.albumName,
    artistName: attributes.artistName,
    durationInMillis: attributes.durationInMillis,
    genreNames: attributes.genreNames,
    artwork: attributes.artwork ?? catalog?.attributes?.artwork,
    releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,
    personalRating: catalog?.attributes?.personalRating,
    album_id: album?.id,
    artist_id: artist?.id,
    catalogId: catalog?.id,
  };
}
