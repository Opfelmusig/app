import type { OpfelMusigClient } from "@opfelmusig/lib";
import { getArtworkExpiresAt, isResourceType } from "@opfelmusig/lib/helpers";
import type { Artwork } from "@opfelmusig/lib/types";
import ms from "ms";

import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import type { DbResourceType } from "#layers/libcore/app/database/types";
import { artworkScopes } from "#layers/libcore/app/lib/scopes";
import { logger } from "~/lib/logger";

interface Expired {
  id: string;
  type: DbResourceType;
}

export async function refreshArtworks(
  db: LibraryDatabase,
  client: OpfelMusigClient,
  signal: AbortSignal,
) {
  const log = logger.withTag("libcore:artwork");

  const expired: Expired[] = [];
  const cutoff = Date.now() + ms("2h");

  log.info("Checking for expiring artworks");
  const startedAt = performance.now();

  await Promise.all([
    db.songs.each((resource) => {
      const expiresAt = getArtworkExpiresAt(resource.artwork)?.getTime();
      if (expiresAt !== undefined && expiresAt <= cutoff) {
        expired.push({ type: "library-songs", id: resource.id });
      }
    }),
    db.albums.each((resource) => {
      const expiresAt = getArtworkExpiresAt(resource.artwork)?.getTime();
      if (expiresAt !== undefined && expiresAt <= cutoff) {
        expired.push({ type: "library-albums", id: resource.id });
      }
    }),
    db.playlists.each((resource) => {
      const expiresAt = getArtworkExpiresAt(resource.artwork)?.getTime();
      if (expiresAt !== undefined && expiresAt <= cutoff) {
        expired.push({ type: "library-playlists", id: resource.id });
      }
    }),
  ]);

  if (expired.length <= 0) {
    log.info("No expired artworks found", {
      durationMs: Math.round(performance.now() - startedAt),
    });

    return false;
  }

  log.info("Found expired artworks to refresh", {
    durationMs: Math.round(performance.now() - startedAt),
    amount: expired.length,
  });

  const readStartedAt = performance.now();

  let updated = false;

  const batchedExpired = Array.from({ length: Math.ceil(expired.length / 100) }, (_, i) =>
    expired.slice(i * 100, (i + 1) * 100),
  );

  const responses = await Promise.all(
    batchedExpired.map((expired) =>
      client.library.getMany(
        {
          "library-songs": expired
            .filter(({ type }) => type === "library-songs")
            .map(({ id }) => id),
          "library-albums": expired
            .filter(({ type }) => type === "library-albums")
            .map(({ id }) => id),
          "library-playlists": expired
            .filter(({ type }) => type === "library-playlists")
            .map(({ id }) => id),
        },
        {
          config: { signal },
          scopes: artworkScopes,
        },
      ),
    ),
  );

  const resources = responses.flatMap(({ data }) => data);

  log.info("Fetched new artwork resources", {
    durationMs: Math.round(performance.now() - readStartedAt),
    amount: resources.length,
  });

  signal.throwIfAborted();

  const filteredResources = resources.filter((resource) =>
    isResourceType(resource, "library-songs", "library-albums", "library-playlists"),
  );

  const writeStartedAt = performance.now();

  await Promise.all(
    filteredResources.map(async (resource) => {
      const details = expired.find(({ id, type }) => id === resource.id && resource.type === type);
      const artwork =
        resource.attributes?.artwork ??
        resource.relationships?.catalog.data[0]?.attributes?.artwork;

      if (!details) return;

      await updateArtwork(db, details, artwork);
      updated = true;
    }),
  );

  log.info("Updated expired artworks", {
    durationMs: Math.round(performance.now() - writeStartedAt),
  });

  return updated;
}

async function updateArtwork(
  db: LibraryDatabase,
  { type, id }: Expired,
  artwork: Artwork | undefined,
): Promise<void> {
  switch (type) {
    case "library-songs":
      await db.songs.update(id, { artwork });
      break;
    case "library-albums":
      await db.albums.update(id, { artwork });
      break;
    case "library-playlists":
      await db.playlists.update(id, { artwork });
      break;
  }
}
