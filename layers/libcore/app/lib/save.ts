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
        db.resources.bulkPut(library.resources),
        db.lists.bulkPut(library.lists),
        db.listResources.bulkPut(library.listResources),
        db.songs.bulkPut(library.songs),
        db.albums.bulkPut(library.albums),
        db.artists.bulkPut(library.artists),
        db.playlists.bulkPut(library.playlists),
        db.folders.bulkPut(library.folders),
        db.libraryCatalogLink.bulkPut(library.libraryCatalogLinks),
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
