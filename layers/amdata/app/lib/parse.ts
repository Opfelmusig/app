import { parseLibraryAlbum, type AlbumTemplate } from "#layers/amdata/app/lib/albums";
import { parseLibraryArtist, type ArtistTemplate } from "#layers/amdata/app/lib/artists";
import {
  parseLibraryPlaylistFolder,
  type LibraryPlaylistFolderTemplate,
} from "#layers/amdata/app/lib/folders";
import { parseLibraryPlaylist, type PlaylistTemplate } from "#layers/amdata/app/lib/playlists";
import { parseLibrarySong, type SongTemplate } from "#layers/amdata/app/lib/songs";
import type { AmResource } from "#layers/amdata/app/types/resources";

export type Templates =
  | SongTemplate
  | AlbumTemplate
  | ArtistTemplate
  | PlaylistTemplate
  | LibraryPlaylistFolderTemplate;

export function parseResource<T extends Templates>(
  resource: T,
): Extract<AmResource, { type: T["type"] }>;
export function parseResource(resource: Templates) {
  switch (resource.type) {
    case "library-songs":
      return parseLibrarySong(resource);
    case "library-albums":
      return parseLibraryAlbum(resource);
    case "library-artists":
      return parseLibraryArtist(resource);
    case "library-playlists":
      return parseLibraryPlaylist(resource);
    case "library-playlist-folders":
      return parseLibraryPlaylistFolder(resource);
  }
}
