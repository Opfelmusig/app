import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import {
  DbListId,
  type ResolvedDbAlbum,
  type ResolvedDbArtist,
  type ResolvedDbFolder,
  type ResolvedDbListResource,
  type ResolvedDbPlaylist,
  type ResolvedDbResource,
  type ResolvedDbSong,
  type ResolvedDbTreeNode,
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

  async getSong(id: string): Promise<ResolvedDbSong | undefined> {
    const item = await this.db.songs.get(id);
    const links = await this.db.libraryCatalogLinks.where("resourceId").equals(id).toArray();
    return item ? { type: "library-songs", item, links } : undefined;
  }

  async getAlbum(id: string): Promise<ResolvedDbAlbum | undefined> {
    const item = await this.db.albums.get(id);
    const links = await this.db.libraryCatalogLinks.where("resourceId").equals(id).toArray();
    return item ? { type: "library-albums", item, links } : undefined;
  }

  async getArtist(id: string): Promise<ResolvedDbArtist | undefined> {
    const item = await this.db.artists.get(id);
    return item ? { type: "library-artists", item } : undefined;
  }

  async getPlaylist(id: string): Promise<ResolvedDbPlaylist | undefined> {
    const item = await this.db.playlists.get(id);
    return item ? { type: "library-playlists", item } : undefined;
  }

  async getFolder(id: string): Promise<ResolvedDbFolder | undefined> {
    const item = await this.db.folders.get(id);
    return item ? { type: "library-playlist-folders", item } : undefined;
  }

  async getResource(id: string): Promise<ResolvedDbResource | undefined> {
    const resource = await this.db.resources.get(id);
    if (!resource) return undefined;

    switch (resource.type) {
      case "library-songs":
        return this.getSong(id);
      case "library-albums":
        return this.getAlbum(id);
      case "library-artists":
        return this.getArtist(id);
      case "library-playlists":
        return this.getPlaylist(id);
      case "library-playlist-folders":
        return this.getFolder(id);
    }
  }

  async getFolderTree(rootId: string = ROOT_FOLDER_ID): Promise<ResolvedDbTreeNode[]> {
    const [folders, playlists] = await Promise.all([
      this.db.folders.toArray(),
      this.db.playlists.toArray(),
    ]);

    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

    function build(parentId: string): ResolvedDbTreeNode[] {
      return [
        ...folders
          .filter((item) => item.parentId === parentId && item.name)
          .sort(byName)
          .map((item) => ({
            type: "library-playlist-folders" as const,
            item,
            children: build(item.id),
          })),
        ...playlists
          .filter((item) => item.parentId === parentId && item.name)
          .sort(byName)
          .map((item) => ({ type: "library-playlists" as const, item })),
      ];
    }

    return build(rootId);
  }

  async getListResources(listId: string): Promise<ResolvedDbListResource[]> {
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
    return this.getListResources(DbListId.Pins);
  }
}
