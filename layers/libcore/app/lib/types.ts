import type {
  DbAlbum,
  DbArtist,
  DbFolder,
  DbLibraryCatalogLink,
  DbList,
  DbListResource,
  DbPlaylist,
  DbResource,
  DbSong,
} from "#layers/libcore/app/database/types";

export interface AppleMusicLibrary {
  resources: DbResource[];
  lists: DbList[];
  listResources: DbListResource[];

  songs: DbSong[];
  albums: DbAlbum[];
  artists: DbArtist[];
  playlists: DbPlaylist[];
  folders: DbFolder[];

  libraryCatalogLinks: DbLibraryCatalogLink[];
}
