import {
  parseCatalogAlbum,
  parseLibraryAlbum,
  type CatalogAlbumTemplate,
  type LibraryAlbumTemplate,
} from "#layers/amdata/app/lib/parsers/albums";
import {
  parseCatalogArtist,
  parseLibraryArtist,
  type CatalogArtistTemplate,
  type LibraryArtistTemplate,
} from "#layers/amdata/app/lib/parsers/artists";
import {
  parseLibraryPlaylistFolder,
  type LibraryPlaylistFolderTemplate,
} from "#layers/amdata/app/lib/parsers/folders";
import {
  parseCatalogPlaylist,
  parseLibraryPlaylist,
  type PlaylistTemplate,
} from "#layers/amdata/app/lib/parsers/playlists";
import { parseProfile, type ProfileTemplate } from "#layers/amdata/app/lib/parsers/profiles";
import {
  parseCatalogSong,
  parseLibrarySong,
  type SongTemplate,
} from "#layers/amdata/app/lib/parsers/songs";
import {
  parseCatalogStation,
  type CatalogStationTemplate,
} from "#layers/amdata/app/lib/parsers/stations";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmResource } from "#layers/amdata/app/types/resources";

export type ResourceTemplate =
  | SongTemplate
  | CatalogAlbumTemplate
  | LibraryAlbumTemplate
  | CatalogArtistTemplate
  | LibraryArtistTemplate
  | PlaylistTemplate
  | CatalogStationTemplate
  | ProfileTemplate
  | LibraryPlaylistFolderTemplate;

type ParsedResource<T extends ResourceTemplate> = T extends { type: "personal-social-profiles" }
  ? AmSocialProfile
  : Extract<AmResource, { type: T["type"] }>;
export function parseResource<T extends ResourceTemplate>(resource: T): ParsedResource<T>;
export function parseResource<T extends ResourceTemplate>(
  resource: T | undefined,
): ParsedResource<T> | undefined;
export function parseResource(resource: ResourceTemplate | undefined): AmResource | undefined {
  if (resource === undefined) return undefined;

  switch (resource.type) {
    case "songs":
      return parseCatalogSong(resource);
    case "library-songs":
      return parseLibrarySong(resource);
    case "albums":
      return parseCatalogAlbum(resource);
    case "library-albums":
      return parseLibraryAlbum(resource);
    case "artists":
      return parseCatalogArtist(resource);
    case "library-artists":
      return parseLibraryArtist(resource);
    case "playlists":
      return parseCatalogPlaylist(resource);
    case "library-playlists":
      return parseLibraryPlaylist(resource);
    case "stations":
      return parseCatalogStation(resource);
    case "library-playlist-folders":
      return parseLibraryPlaylistFolder(resource);
    case "social-profiles":
    case "personal-social-profiles":
      return parseProfile(resource);
  }
}
