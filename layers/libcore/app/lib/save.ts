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
        db.listResources.bulkPut([...library.listResources.values()]),
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
