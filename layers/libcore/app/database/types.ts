import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

export enum DbListId {
  Songs = "songs",
  Albums = "albums",
  Artists = "artists",
  Playlists = "playlists",
  Pins = "pins",
}

export interface DbLibraryState {
  id: "library";
  profileId?: string;
  lastSyncedAt?: Date;
}

export type DbResourceType = "song" | "album" | "artist" | "playlist" | "folder";

export type DbCatalogLinkType = "album" | "artist";

export interface DbResource {
  id: string;
  type: DbResourceType;
}

export interface DbList {
  id: string;
}

export interface DbListResource {
  id: string;
  resource_id: string;
  list_id: string;
  position: number;
}

export interface DbSong {
  id: string;

  name: string;
  artistName: string;
  albumName: string;
  genreNames: string[];
  artwork?: Artwork;
  durationInMillis: number;
  trackNumber?: number;
  releaseDate?: string;

  catalogId?: string;
  personalRating?: RatingValue;

  album_id?: string;
  artist_id?: string;
}

export interface DbAlbum {
  id: string;

  name: string;
  artistName: string;
  genreNames: string[];
  artwork?: Artwork;
  releaseDate?: string;
  dateAdded?: Date;

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  tracks_list_id: string;
  artist_id?: string;
}

export interface DbArtist {
  id: string;

  name: string;
  artwork?: Artwork;
  genreNames: string[];
  catalogId?: string;
  personalRating?: RatingValue;

  albums_list_id: string;
}

export interface DbPlaylist {
  id: string;

  name: string;
  artwork?: Artwork;
  description?: string;
  lastModifiedDate?: Date;
  canEdit: boolean;
  isPublic: boolean;
  dateAdded?: Date;
  tags: string[];

  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;
  curatorName?: string;
  curatorHandle?: string;

  tracks_list_id: string;
}

export interface DbFolder {
  id: string;

  name: string;
  dateAdded?: Date;

  children_list_id: string;
}

export interface DbLibraryCatalogLink {
  id: string;
  resource_id: string;
  catalog_id: string;
  type: DbCatalogLinkType;
  name: string;
  position: number;
}
