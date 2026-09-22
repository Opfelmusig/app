import Dexie, { type Table } from "dexie";

import type {
  DbAlbum,
  DbArtist,
  DbFolder,
  DbLibraryCatalogLink,
  DbLibraryState,
  DbList,
  DbListResource,
  DbPlaylist,
  DbResource,
  DbSong,
} from "#layers/libcore/app/database/types";

export class LibraryDatabase extends Dexie {
  libraryState!: Table<DbLibraryState, string>;

  resources!: Table<DbResource, string>;
  lists!: Table<DbList, string>;
  listResources!: Table<DbListResource, string>;

  songs!: Table<DbSong, string>;
  albums!: Table<DbAlbum, string>;
  artists!: Table<DbArtist, string>;
  playlists!: Table<DbPlaylist, string>;
  folders!: Table<DbFolder, string>;

  libraryCatalogLink!: Table<DbLibraryCatalogLink, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      libraryState: "id",

      resources: "id, type",
      lists: "id",
      listResources: "id, resourceId, &[listId+position]",

      songs: "id",
      albums: "id",
      artists: "id",
      playlists: "id",
      folders: "id",

      libraryCatalogLink: "id, &[resourceId+type+position]",
    });
  }
}
