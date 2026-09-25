import type {
  DbAlbum,
  DbArtist,
  DbFolder,
  DbLibraryCatalogLink,
  DbListResource,
  DbPlaylist,
  DbResource,
  DbSong,
} from "#layers/libcore/app/database/types";

export interface AppleMusicLibrary {
  resources: Map<string, DbResource>;
  listResources: Map<string, DbListResource>;

  songs: Map<string, DbSong>;
  albums: Map<string, DbAlbum>;
  artists: Map<string, DbArtist>;
  playlists: Map<string, DbPlaylist>;
  folders: Map<string, DbFolder>;

  libraryCatalogLinks: Map<string, DbLibraryCatalogLink>;
}
