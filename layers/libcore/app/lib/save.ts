import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export async function saveAppleMusicLibrary(
  db: LibraryDatabase,
  lastSyncedAt: Date,
  profileId: string,
  library: AppleMusicLibrary,
  signal: AbortSignal,
) {
  await db.transaction("rw", db.tables, async (transaction) => {
    const abort = () => transaction.abort();
    signal.addEventListener("abort", abort, { once: true });

    try {
      signal.throwIfAborted();

      await Promise.all(db.tables.map((table) => table.clear()));

      await Promise.all([
        db.resources.bulkPut([...library.resources.values()]),
        db.lists.bulkPut([...library.lists.values()]),
        db.listResources.bulkPut([...library.listResources.values()]),
        db.songs.bulkPut([...library.songs.values()]),
        db.albums.bulkPut([...library.albums.values()]),
        db.artists.bulkPut([...library.artists.values()]),
        db.playlists.bulkPut([...library.playlists.values()]),
        db.folders.bulkPut([...library.folders.values()]),
        db.libraryCatalogLink.bulkPut([...library.libraryCatalogLinks.values()]),
      ]);

      await db.libraryState.put({
        id: "library",
        profileId,
        lastSyncedAt,
      });
    } finally {
      signal.removeEventListener("abort", abort);
    }
  });
}
