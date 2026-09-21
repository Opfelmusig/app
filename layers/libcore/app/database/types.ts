import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

export interface LibraryState {
  id: "library";
  profileId?: string;
  lastSyncedAt?: Date;
}

export type ResourceType = "song" | "album" | "artist" | "playlist" | "folder";

export type BuiltInListId =
  | "recently-added"
  | "songs"
  | "albums"
  | "artists"
  | "playlists"
  | "pins";

export type CatalogLinkType = "album" | "artist";

export interface Resource {
  id: string;
  type: ResourceType;
}

export interface List {
  id: string;
}

export interface ListResource {
  id: string;
  resource_id: string;
  list_id: string;
  position: number;
}

export interface Song {
  id: string;

  name: string;
  artistName: string;
  albumName: string;
  genreNames: string[];
  artwork: Artwork;
  durationInMillis: number;
  trackNumber?: number;
  releaseDate?: Date;

  catalogId?: string;
  personalRating?: RatingValue;

  album_id?: string;
  artist_id?: string;
}

export interface Album {
  id: string;

  name: string;
  artistName: string;
  genreNames: string[];
  artwork: Artwork;
  releaseDate?: Date;
  dateAdded?: Date;

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  tracks_list_id: string;
  artist_id?: string;
}

export interface Artist {
  id: string;

  name: string;
  artwork?: Artwork;
  genreNames: string[];
  catalogId?: string;
  personalRating?: RatingValue;

  albums_list_id: string;
}

export interface Playlist {
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

export interface Folder {
  id: string;

  name: string;
  dateAdded?: Date;

  children_list_id: string;
}

export interface LibraryCatalogLink {
  id: string;
  resource_id: string;
  catalog_id: string;
  type: CatalogLinkType;
  name: string;
  position: number;
}
