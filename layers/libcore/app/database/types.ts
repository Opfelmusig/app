export enum DbListId {
  Songs = "songs",
  Albums = "albums",
  Artists = "artists",
  Playlists = "playlists",
  Pins = "pins",
  PlaylistFolders = "playlist-folders",
}

export type DbPlaylistTracksListId = `library-playlists:${string}`;
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
