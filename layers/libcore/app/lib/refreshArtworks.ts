import type { OpfelMusigClient } from "@opfelmusig/lib";
import { getArtworkExpiresAt, isResourceType } from "@opfelmusig/lib/helpers";
import type { Artwork } from "@opfelmusig/lib/types";
import { chunk, groupBy, indexBy, mapValues } from "remeda";

import { libraryArtworkScopes } from "#layers/amdata/app/lib/scopes/library";
import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import type { DbResourceType } from "#layers/libcore/app/database/types";

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

  await db.resources
    .where("type")
    .equals("library-songs")
    .each((resource) => {
      if (!("artwork" in resource.attributes)) return;

      const expiresAt = getArtworkExpiresAt(resource.attributes.artwork)?.getTime();

      if (expiresAt !== undefined && expiresAt <= cutoff) {
        expired.push({ type: resource.type, id: resource.id });
      }
    });

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

  const expiredByKey = indexBy(expired, ({ type, id }) => `${type}:${id}`);

  const responses = await Promise.all(
    chunk(expired, 100).map((batch) => {
      const idsByType = mapValues(
        groupBy(batch, ({ type }) => type),
        (resources) => resources.map(({ id }) => id),
      );

      return client.library.getMany(
        {
          "library-songs": idsByType["library-songs"] ?? [],
        },
        {
          config: { signal },
          scopes: libraryArtworkScopes,
        },
      );
    }),
  );

  const resources = responses.flatMap(({ data }) => data);

  log.info("Fetched new artwork resources", {
    durationMs: Math.round(performance.now() - readStartedAt),
    amount: resources.length,
  });

  signal.throwIfAborted();

  const filteredResources = resources.filter((resource) =>
    isResourceType(resource, "library-songs"),
  );

  const writeStartedAt = performance.now();

  await Promise.all(
    filteredResources.map(async (resource) => {
      const details = expiredByKey[`${resource.type}:${resource.id}`];
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
  { id }: Expired,
  artwork: Artwork | undefined,
): Promise<void> {
  await db.resources.update(id, {
    "attributes.artwork": artwork,
  });
}
