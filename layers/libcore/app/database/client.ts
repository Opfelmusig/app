import type { Collection } from "dexie";
import { filter, flatMap, isDefined, isTruthy, pipe, sort, unique } from "remeda";

import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import {
  DbListId,
  type DbListIdentifier,
  type DbListResourceByList,
  type DbResourceType,
  type DbResourceByType,
} from "#layers/libcore/app/database/types";

function getAllowedResourceTypes(listId: DbListIdentifier): readonly DbResourceType[] {
  switch (listId) {
    case DbListId.Songs:
      return ["library-songs"];
    case DbListId.Albums:
      return ["library-albums"];
    case DbListId.Artists:
      return ["library-artists"];
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
    const [songs, albums, artists] = await Promise.all([
      this.resourcesByType("library-songs").count(),
      this.resourcesByType("library-albums").count(),
      this.resourcesByType("library-artists").count(),
    ]);

    return {
      songs,
      albums,
      artists,
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

  async getListResources<L extends DbListIdentifier>(listId: L) {
    const entries = await this.db.listResources.where("listId").equals(listId).sortBy("position");

    const allowedTypes = getAllowedResourceTypes(listId);

    const results = await Promise.all(
      entries.map(async (entry) => {
        const resource = await this.db.resources.get(entry.resourceId);
        return resource && allowedTypes.includes(resource.type)
          ? createListResource(resource, entry.listId, entry.position)
          : undefined;
      }),
    );

    return results.filter(isDefined) as DbListResourceByList<L>[];
  }

  async getArtistAlbums(id: string) {
    const albums = await this.resourcesByType("library-albums")
      .filter((album) => album.extras.artistId === id)
      .reverse()
      .sortBy("extras.dateAdded");

    return createListResources(albums, `library-artists:${id}`);
  }

  async getAlbumTracks(id: string): Promise<AmListResource<AmLibrarySong>[]> {
    const songs = await this.resourcesByType("library-songs")
      .filter((song) => song.extras.albumId === id)
      .toArray();

    return createListResources(songs, `library-albums:${id}`);
  }

  async getGenres() {
    const albums = await this.resourcesByType("library-albums").toArray();

    return pipe(
      albums,
      flatMap((album) => album.attributes.genreNames),
      filter(isTruthy),
      unique(),
      sort((a, b) => a.localeCompare(b)),
    );
  }

  async getGenreAlbums(genre: string) {
    const albums = await this.resourcesByType("library-albums")
      .filter((album) => album.attributes.genreNames.includes(genre))
      .reverse()
      .sortBy("extras.dateAdded");

    return createListResources(albums, `library-genre:${genre}`);
  }
}
