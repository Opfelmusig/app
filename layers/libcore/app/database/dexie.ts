import Dexie, { type Table } from "dexie";

import type {
  DbLibraryState,
  DbListResource,
  DbResource,
} from "#layers/libcore/app/database/types";

export class LibraryDatabase extends Dexie {
  libraryState!: Table<DbLibraryState, string>;

  resources!: Table<DbResource, string>;
  listResources!: Table<DbListResource, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      libraryState: "id",

      resources: "id, type, parentId, catalogId",
      listResources: "id, resourceId, &[listId+position]",
    });
  }
}
