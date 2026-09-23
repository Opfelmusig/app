import type { OpfelMusigClient } from "@opfelmusig/lib";

import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import { fetchAppleMusicLibrary } from "#layers/libcore/app/lib/fetch";
import { saveAppleMusicLibrary } from "#layers/libcore/app/lib/save";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";
import { logger } from "~/lib/logger";

export async function syncAppleMusicLibrary(
  db: LibraryDatabase,
  client: OpfelMusigClient,
  profileId: string,
  signal: AbortSignal,
  progress: LibraryProgress,
) {
  const log = logger.withTag("libcore:sync");

  log.info("Apple Music library fetch started");

  progress.state = "fetching";

  const startedAt = performance.now();

  progress.songs = 0;
  progress.albums = 0;
  progress.artists = 0;
  progress.playlists = 0;

  const library = await fetchAppleMusicLibrary(client, signal, progress);

  log.info("Apple Music library fetch completed", {
    durationMs: Math.round(performance.now() - startedAt),
  });

  const writeStartedAt = performance.now();

  log.info("Local library write started");

  progress.state = "writing";

  const lastSyncedAt = new Date();

  await saveAppleMusicLibrary(db, lastSyncedAt, profileId, library, signal);

  log.info("Local library write completed", {
    durationMs: Math.round(performance.now() - writeStartedAt),
  });

  return lastSyncedAt;
}
