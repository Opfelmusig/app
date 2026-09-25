import Dexie, { type Table } from "dexie";

import type {
  DbAlbum,
  DbArtist,
  DbFolder,
  DbLibraryCatalogLink,
  DbLibraryState,
  DbListResource,
  DbPlaylist,
  DbResource,
  DbSong,
} from "#layers/libcore/app/database/types";

export class LibraryDatabase extends Dexie {
  libraryState!: Table<DbLibraryState, string>;

  resources!: Table<DbResource, string>;
  listResources!: Table<DbListResource, string>;

  songs!: Table<DbSong, string>;
  albums!: Table<DbAlbum, string>;
  artists!: Table<DbArtist, string>;
  playlists!: Table<DbPlaylist, string>;
  folders!: Table<DbFolder, string>;

  libraryCatalogLinks!: Table<DbLibraryCatalogLink, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      libraryState: "id",

      resources: "id, type",
      listResources: "id, resourceId, &[listId+position]",

      songs: "id, albumId, catalogId",
      albums: "id, artistId, catalogId",
      artists: "id, catalogId",
      playlists: "id, parentId, catalogId",
      folders: "id, parentId",

      libraryCatalogLinks: "id, &[resourceId+type+position]",
    });
  }
}
