import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";

export class LibraryClient {
  private readonly db: LibraryDatabase;

  constructor(db: LibraryDatabase) {
    this.db = db;
  }

  delete() {
    return this.db.delete({ disableAutoOpen: false });
  }

  state() {
    return this.db.library_state.get("library");
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

  songs() {
    return this.db.songs.toArray();
  }
}
