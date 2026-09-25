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

export type DbResourceType =
  | "library-songs"
  | "library-albums"
  | "library-artists"
  | "library-playlists"
  | "library-playlist-folders";

export type DbCatalogLinkType = "album" | "artist";

export interface DbResource {
  id: string;
  type: DbResourceType;
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
  genreNames: readonly string[];
  artwork?: Artwork;
  durationInMillis: number;
  discNumber?: number;
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
  genreNames: readonly string[];
  artwork?: Artwork;
  releaseDate?: string;
  dateAdded?: Date;

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  artistId?: string;
}

export interface DbArtist {
  id: string;

  name: string;
  artwork?: Artwork;
  genreNames: readonly string[];

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;
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
  tags: readonly string[];
  curatorName?: string;
  curatorSocialHandle?: string;

  editorialVideo?: EditorialVideo;
  catalogId?: string;
  personalRating?: RatingValue;

  tracksListId: string;
  parentId?: string;
}

export interface DbFolder {
  id: string;

  name: string;
  dateAdded?: Date;

  parentId?: string;
}

export interface DbLibraryCatalogLink {
  id: string;
  resourceId: string;
  catalogId: string;
  type: DbCatalogLinkType;
  name: string;
  position: number;
}

export interface ResolvedDbSong {
  type: "library-songs";
  item: DbSong;
  links: DbLibraryCatalogLink[];
}

export interface ResolvedDbAlbum {
  type: "library-albums";
  item: DbAlbum;
  links: DbLibraryCatalogLink[];
}

export interface ResolvedDbArtist {
  type: "library-artists";
  item: DbArtist;
}

export interface ResolvedDbPlaylist {
  type: "library-playlists";
  item: DbPlaylist;
}

export interface ResolvedDbFolder {
  type: "library-playlist-folders";
  item: DbFolder;
}

export type ResolvedDbResource =
  | ResolvedDbSong
  | ResolvedDbAlbum
  | ResolvedDbArtist
  | ResolvedDbPlaylist
  | ResolvedDbFolder;

export type ResolvedDbFolderNode = ResolvedDbFolder & {
  children: ResolvedDbTreeNode[];
};

export type ResolvedDbTreeNode = ResolvedDbPlaylist | ResolvedDbFolderNode;

export interface ResolvedDbListResource {
  entry: DbListResource;
  resource: ResolvedDbResource;
}
