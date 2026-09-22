import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

export enum DbListId {
  Songs = "songs",
  Albums = "albums",
  Artists = "artists",
  Playlists = "playlists",
  Pins = "pins",
  PlaylistFolders = "playlist-folders",
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
  resourceId: string;
  listId: string;
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

  albumId?: string;
  artistId?: string;
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

  tracksListId: string;
  artistId?: string;
}

export interface DbArtist {
  id: string;

  name: string;
  artwork?: Artwork;
  genreNames: string[];

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  albumsListId: string;
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
  curatorName?: string;
  curatorSocialHandle?: string;

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  tracksListId: string;
}

export interface DbFolder {
  id: string;

  name: string;
  dateAdded?: Date;

  childrenListId: string;
}

export interface DbLibraryCatalogLink {
  id: string;
  resourceId: string;
  catalogId: string;
  type: DbCatalogLinkType;
  name: string;
  position: number;
}
