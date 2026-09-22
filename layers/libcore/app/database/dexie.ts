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
  library_state!: Table<DbLibraryState, string>;

  resources!: Table<DbResource, string>;
  lists!: Table<DbList, string>;
  list_resources!: Table<DbListResource, string>;

  songs!: Table<DbSong, string>;
  albums!: Table<DbAlbum, string>;
  artists!: Table<DbArtist, string>;
  playlists!: Table<DbPlaylist, string>;
  folders!: Table<DbFolder, string>;

  library_catalog_link!: Table<DbLibraryCatalogLink, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      library_state: "id",

      resources: "id, type",
      lists: "id",
      list_resources: "id, resource_id, &[list_id+position]",

      songs: "id",
      albums: "id",
      artists: "id",
      playlists: "id",
      folders: "id",

      library_catalog_link: "id, &[resource_id+type+position]",
    });
  }
}
