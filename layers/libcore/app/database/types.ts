import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmLibrarySong } from "#layers/amdata/app/types/songs";

export enum DbListId {
  Songs = "songs",
  Albums = "albums",
  Artists = "artists",
  Playlists = "playlists",
  Pins = "pins",
  PlaylistFolders = "playlist-folders",
}

export type DbPlaylistTracksListId = `playlist:${string}:tracks`;
export type DbListIdentifier = DbListId | DbPlaylistTracksListId;

export interface DbLibraryState {
  id: "library";
  version: number;
  profileId?: string;
  lastSyncedAt?: Date;
}

export type DbResource =
  | AmLibrarySong
  | AmLibraryAlbum
  | AmLibraryArtist
  | AmLibraryPlaylist
  | AmLibraryPlaylistFolder;

export interface DbListResource {
  id: string;
  resourceId: string;
  listId: string;
  position: number;
}

type DbResourceByList = {
  [DbListId.Songs]: AmLibrarySong;
  [DbListId.Albums]: AmLibraryAlbum;
  [DbListId.Artists]: AmLibraryArtist;
  [DbListId.Playlists]: AmLibraryPlaylist;
  [DbListId.PlaylistFolders]: AmLibraryPlaylistFolder;
  [DbListId.Pins]: Exclude<DbResource, AmLibraryPlaylistFolder>;
  [listId: DbPlaylistTracksListId]: AmLibrarySong;
};

export type DbListResourceByList<L extends DbListIdentifier> = AmListResource<DbResourceByList[L]>;

export type DbResourceType = DbResource["type"];

export type DbResourceByType<T extends DbResourceType> = Extract<DbResource, { type: T }>;
