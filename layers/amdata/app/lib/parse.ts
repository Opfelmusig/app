import { parseLibraryAlbum, type AlbumTemplate } from "#layers/amdata/app/lib/albums";
import { parseLibraryArtist, type ArtistTemplate } from "#layers/amdata/app/lib/artists";
import {
  parseLibraryPlaylistFolder,
  type LibraryPlaylistFolderTemplate,
} from "#layers/amdata/app/lib/folders";
import {
  parseCatalogPlaylist,
  parseLibraryPlaylist,
  type PlaylistTemplate,
} from "#layers/amdata/app/lib/playlists";
import { parseProfile, type ProfileTemplate } from "#layers/amdata/app/lib/profiles";
import { parseLibrarySong, type SongTemplate } from "#layers/amdata/app/lib/songs";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmResource } from "#layers/amdata/app/types/resources";

export type Templates =
  | SongTemplate
  | AlbumTemplate
  | ArtistTemplate
  | PlaylistTemplate
  | ProfileTemplate
  | LibraryPlaylistFolderTemplate;

type ParsedResource<T extends Templates> = T extends { type: "personal-social-profiles" }
  ? AmSocialProfile
  : Extract<AmResource, { type: T["type"] }>;
export function parseResource<T extends Templates>(resource: T): ParsedResource<T>;
export function parseResource<T extends Templates>(
  resource: T | undefined,
): ParsedResource<T> | undefined;
export function parseResource(resource: Templates | undefined): AmResource | undefined {
  if (resource === undefined) return undefined;

  switch (resource.type) {
    case "library-songs":
      return parseLibrarySong(resource);
    case "library-albums":
      return parseLibraryAlbum(resource);
    case "library-artists":
      return parseLibraryArtist(resource);
    case "playlists":
      return parseCatalogPlaylist(resource);
    case "library-playlists":
      return parseLibraryPlaylist(resource);
    case "library-playlist-folders":
      return parseLibraryPlaylistFolder(resource);
    case "social-profiles":
    case "personal-social-profiles":
      return parseProfile(resource);
  }
}
