import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import {
  DbListId,
  type ResolvedListItem,
  type ResolvedResource,
} from "#layers/libcore/app/database/types";

export class LibraryClient {
  private readonly db: LibraryDatabase;

  constructor(db: LibraryDatabase) {
    this.db = db;
  }

  delete() {
    return this.db.delete({ disableAutoOpen: false });
  }

  state() {
    return this.db.libraryState.get("library");
  }

  async stats() {
    const [songs, albums, artists, playlists] = await Promise.all([
      this.db.songs.count(),
      this.db.albums.count(),
      this.db.artists.count(),
      this.db.playlists.count(),
    ]);

    return {
      songs,
      albums,
      artists,
      playlists,
    };
  }

  async getResource(id: string): Promise<ResolvedResource | undefined> {
    const resource = await this.db.resources.get(id);
    if (!resource) return undefined;

    switch (resource.type) {
      case "song": {
        const item = await this.db.songs.get(id);
        return item ? { type: "song", item } : undefined;
      }
      case "album": {
        const item = await this.db.albums.get(id);
        return item ? { type: "album", item } : undefined;
      }
      case "artist": {
        const item = await this.db.artists.get(id);
        return item ? { type: "artist", item } : undefined;
      }
      case "playlist": {
        const item = await this.db.playlists.get(id);
        return item ? { type: "playlist", item } : undefined;
      }
      case "folder": {
        const item = await this.db.folders.get(id);
        return item ? { type: "folder", item } : undefined;
      }
    }
  }

  async getListItems(listId: string): Promise<ResolvedListItem[]> {
    const entries = await this.db.listResources.where("listId").equals(listId).sortBy("position");

    return Promise.all(
      entries.map(async (entry) => {
        const resource = await this.getResource(entry.resourceId);
        if (!resource) {
          throw new Error(`Missing resource ${entry.resourceId} in list ${listId}`);
        }

        return { entry, resource };
      }),
    );
  }

  songs() {
    return this.db.songs.toArray();
  }

  pins() {
    return this.getListItems(DbListId.Pins);
  }
}
