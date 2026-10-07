import { parseLibraryAlbum, type LibraryAlbumTemplate } from "#layers/amdata/app/lib/albums";
import { parseLibraryArtist, type LibraryArtistTemplate } from "#layers/amdata/app/lib/artists";
import {
  parseLibraryPlaylistFolder,
  type LibraryPlaylistFolderTemplate,
} from "#layers/amdata/app/lib/folders";
import {
  parseLibraryPlaylist,
  type LibraryPlaylistTemplate,
} from "#layers/amdata/app/lib/playlists";
import { parseLibrarySong, type LibrarySongTemplate } from "#layers/amdata/app/lib/songs";
import type { AmResources } from "#layers/amdata/app/types/resources";

export type Templates =
  | LibrarySongTemplate
  | LibraryAlbumTemplate
  | LibraryArtistTemplate
  | LibraryPlaylistTemplate
  | LibraryPlaylistFolderTemplate;

export function parseResource<T extends Templates>(
  resource: T,
): Extract<AmResources, { type: T["type"] }>;
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
