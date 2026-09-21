import Dexie, { type Table } from "dexie";
import type * as Library from "#layers/libcore/app/database/types";

export class LibraryDatabase extends Dexie {
  library_state!: Table<Library.LibraryState, string>;

  resources!: Table<Library.Resource, string>;
  lists!: Table<Library.List, string>;
  list_resources!: Table<Library.ListResource, string>;

  songs!: Table<Library.Song, string>;
  albums!: Table<Library.Album, string>;
  artists!: Table<Library.Artist, string>;
  playlists!: Table<Library.Playlist, string>;
  folders!: Table<Library.Folder, string>;

  library_catalog_link!: Table<Library.LibraryCatalogLink, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      library_state: "id",

      resources: "id, type",
      lists: "id",
      list_resources: "id, resource_id, &[list_id+position]",

      songs: "resource_id",
      albums: "resource_id",
      artists: "resource_id",
      playlists: "resource_id",
      folders: "resource_id",

      library_catalog_link: "id, &[resource_id+type+position]",
    });
  }
}
