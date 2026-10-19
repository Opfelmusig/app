export enum DbListId {
  Songs = "songs",
  Artists = "artists",
}

export type DbListIdentifier = DbListId;

export interface DbLibraryState {
  id: "library";
  version: number;
  profileId?: string;
  lastSyncedAt?: Date;
}

export type DbResource = AmLibrarySong | AmLibraryArtist;

export interface DbListResource {
  id: string;
  resourceId: string;
  listId: string;
  position: number;
}

type DbResourceByList = {
  [DbListId.Songs]: AmLibrarySong;
  [DbListId.Artists]: AmLibraryArtist;
};

export type DbListResourceByList<L extends DbListIdentifier> = AmListResource<DbResourceByList[L]>;

export type DbResourceType = DbResource["type"];

export type DbResourceByType<T extends DbResourceType> = Extract<DbResource, { type: T }>;
