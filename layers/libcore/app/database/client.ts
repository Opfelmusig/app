import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import type { Collection } from "dexie";

import type { AmLibraryPlaylistFolder, AmLibraryTreeNode } from "#layers/amdata/app/types/folders";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmLibrarySong } from "#layers/amdata/app/types/songs";
import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import {
  DbListId,
  type DbListIdentifier,
  type DbListResourceByList,
  type DbResourceType,
  type DbResourceByType,
  type DbResource,
} from "#layers/libcore/app/database/types";

function getAllowedResourceTypes(listId: DbListIdentifier): readonly DbResourceType[] {
  switch (listId) {
    case DbListId.Songs:
      return ["library-songs"];
    case DbListId.Albums:
      return ["library-albums"];
    case DbListId.Artists:
      return ["library-artists"];
    case DbListId.Playlists:
      return ["library-playlists"];
    case DbListId.PlaylistFolders:
      return ["library-playlist-folders"];
    case DbListId.Pins:
      return ["library-songs", "library-albums", "library-artists", "library-playlists"];
    default:
      return ["library-songs"];
  }
}

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
      this.resourcesByType("library-songs").count(),
      this.resourcesByType("library-albums").count(),
      this.resourcesByType("library-artists").count(),
      this.resourcesByType("library-playlists").count(),
    ]);

    return {
      songs,
      albums,
      artists,
      playlists,
    };
  }

  getSong(id: string) {
    return this.resourceByType(id, "library-songs");
  }

  getAlbum(id: string) {
    return this.resourceByType(id, "library-albums");
  }

  getArtist(id: string) {
    return this.resourceByType(id, "library-artists");
  }

  getPlaylist(id: string) {
    return this.resourceByType(id, "library-playlists");
  }

  getFolder(id: string) {
    return this.resourceByType(id, "library-playlist-folders");
  }

  async resourceByType<T extends DbResourceType>(
    id: string,
    type: T,
  ): Promise<DbResourceByType<T> | undefined> {
    const resource = await this.getResource(id);
    if (resource?.type !== type) return undefined;

    return resource as DbResourceByType<T>;
  }

  resourcesByType<T extends DbResourceType>(type: T): Collection<DbResourceByType<T>, string> {
    return this.db.resources.where("type").equals(type) as Collection<DbResourceByType<T>, string>;
  }

  getResource(id: string) {
    return this.db.resources.get(id);
  }

  async getFolderTree(rootId: string = ROOT_FOLDER_ID) {
    const [folders, playlists] = await Promise.all([
      this.resourcesByType("library-playlist-folders").toArray(),
      this.resourcesByType("library-playlists").toArray(),
    ]);

    const byName = (
      left: AmLibraryPlaylist | AmLibraryPlaylistFolder,
      right: AmLibraryPlaylist | AmLibraryPlaylistFolder,
    ) => left.attributes.name.localeCompare(right.attributes.name);

    function build(parentId: string): AmLibraryTreeNode[] {
      return [
        ...folders
          .filter((item) => item.extras.parentId === parentId && item.attributes.name)
          .sort(byName)
          .map((item) => ({
            type: item.type,
            item,
            children: build(item.id),
          })),
        ...playlists
          .filter((item) => item.extras.parentId === parentId && item.attributes.name)
          .sort(byName)
          .map((item) => ({ type: item.type, item })),
      ];
    }

    return build(rootId);
  }

  async getListResources<L extends DbListIdentifier>(listId: L) {
    const entries = await this.db.listResources.where("listId").equals(listId).sortBy("position");

    const allowedTypes = getAllowedResourceTypes(listId);

    const results = await Promise.all(
      entries.map(async (entry) => {
        const resource = await this.db.resources.get(entry.resourceId);
        return resource && allowedTypes.includes(resource.type)
          ? ({
              key: entry.id,
              position: entry.position,
              resource,
            } satisfies AmListResource<DbResource>)
          : undefined;
      }),
    );

    return results.filter((result) => result !== undefined) as DbListResourceByList<L>[];
  }

  getArtistAlbums(id: string) {
    return this.resourcesByType("library-albums")
      .filter((album) => album.extras.artistId === id)
      .reverse()
      .sortBy("extras.dateAdded");
  }

  async getAlbumTracks(id: string): Promise<AmListResource<AmLibrarySong>[]> {
    const songs = await this.resourcesByType("library-songs")
      .filter((song) => song.extras.albumId === id)
      .toArray();

    return songs.map(
      (song, i) =>
        ({
          key: song.id,
          position: i,
          resource: song,
        }) satisfies AmListResource<AmLibrarySong>,
    );
  }

  async getGenres() {
    const albums = await this.resourcesByType("library-albums").toArray();

    return [...new Set(albums.flatMap((album) => album.attributes.genreNames))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  getGenreAlbums(genre: string) {
    return this.resourcesByType("library-albums")
      .filter((album) => album.attributes.genreNames.includes(genre))
      .reverse()
      .sortBy("extras.dateAdded");
  }
}
