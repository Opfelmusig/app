import type * as Library from "#layers/libcore/app/database/types";

export interface AppleMusicLibrary {
  resources: Library.Resource[];
  lists: Library.List[];
  listResources: Library.ListResource[];

  songs: Library.Song[];
  albums: Library.Album[];
  artists: Library.Artist[];
  playlists: Library.Playlist[];
  folders: Library.Folder[];

  libraryCatalogLinks: Library.LibraryCatalogLink[];
}
