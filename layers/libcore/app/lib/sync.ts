import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import type * as Library from "#layers/libcore/app/database/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";
import type { OpfelMusigClient } from "@opfelmusig/lib";
import { logger } from "~/lib/logger";

/** CURRENTLY MOKED */
export async function syncAppleMusic(
  db: LibraryDatabase,
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
) {
  const log = logger.withTag("sync");

  log.info("Fetching data from Apple Music");

  progress.state = "fetching";

  const startedAt = performance.now();

  // Simulate download
  await sleep(10_000, signal);

  log.info("Fetched data from Apple Music", {
    durationMs: Math.round(performance.now() - startedAt),
  });
  log.info("Writing to database");

  progress.songs = 3;
  progress.state = "writing";

  const lastSyncedAt = new Date();

  await db.transaction("rw", db.tables, async () => {
    await db.songs.clear();

    await db.songs.bulkPut([createRandomSong(), createRandomSong(), createRandomSong()]);

    await db.library_state.put({
      id: "library",
      lastSyncedAt,
    });
  });

  log.info("Saved data to database", {
    durationMs: Math.round(performance.now() - startedAt),
  });

  return lastSyncedAt;
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();

    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);

    function abort() {
      clearTimeout(timeout);
      reject(signal.reason);
    }

    signal.addEventListener("abort", abort, { once: true });
  });
}

function createRandomSong(): Library.Song {
  const id = crypto.randomUUID();
  return {
    resource_id: id,
    name: `Song ${id}`,
    artistName: "Artist",
    albumName: "Album",
    artwork: {
      url: "",
      width: 0,
      height: 0,
    },
    genreNames: [],
    durationInMillis: 180_000,
    trackNumber: 1,
  };
}
