import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect, isNotResourceType } from "@opfelmusig/lib/helpers";

import { parseLibraryPlaylist } from "#layers/amdata/app/lib/playlists";
import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import { createEmptyLibrary } from "#layers/libcore/app/lib/prepare/helpers";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import { playlistsScopes, songsScopes } from "#layers/libcore/app/lib/scopes";

export async function refreshPlaylist(id: string, db: LibraryDatabase, client: OpfelMusigClient) {
  const log = logger.withTag("libcore:refresh");

  const playlist = await db.resources.get(id);
  if (playlist?.type !== "library-playlists") return;

  if (!playlist.extras.catalogId || playlist.extras.canEdit) return;

  log.info("Checking for expired catalog playlist", { id, catalogId: playlist.extras.catalogId });

  const result = await client.library.playlists.get(id, {
    scopes: playlistsScopes,
  });

  const newPlaylist = result.data[0];
  if (!newPlaylist?.attributes) return;

  const updatedPlaylist = parseLibraryPlaylist(newPlaylist);
  const newLastModifiedDate = updatedPlaylist.attributes.lastModifiedDate;

  if (!newLastModifiedDate || Number.isNaN(newLastModifiedDate.getTime())) return;
  if (
    playlist.attributes.lastModifiedDate &&
    playlist.attributes.lastModifiedDate.getTime() === newLastModifiedDate.getTime()
  )
    return;

  log.info("Catalog playlist is expired, refreshing", { id });
  const readStartedAt = performance.now();

  const tracks = await collect(
    client.library.playlists.iterateRelationship(id, "tracks", {
      limit: 100,
      scopes: songsScopes,
    }),
  );

  const songs = tracks.filter((resource) => isNotResourceType(resource, "library-music-videos"));

  const prepared = createEmptyLibrary();

  const listId = playlistTracksListId(id);
  addSongs(prepared, songs, listId);

  log.info("Fetched playlist tracks", {
    id,
    durationMs: Math.round(performance.now() - readStartedAt),
  });

  const writeStartedAt = performance.now();

  await db.transaction("rw", [db.listResources, db.resources], async () => {
    const currentPlaylist = await db.resources.get(id);
    if (currentPlaylist?.type !== "library-playlists") return;

    if (!currentPlaylist.extras.catalogId || currentPlaylist.extras.canEdit) return;
    if (
      currentPlaylist.extras.catalogId !== playlist.extras.catalogId ||
      currentPlaylist.attributes.lastModifiedDate?.getTime() !==
        playlist.attributes.lastModifiedDate?.getTime()
    )
      return;

    const oldEntries = await db.listResources.where("listId").equals(listId).toArray();

    await db.resources.put(updatedPlaylist);
    await db.resources.bulkPut([...prepared.resources.values()]);
    await db.listResources.where("listId").equals(listId).delete();

    await db.listResources.bulkPut([...prepared.listResources.values()]);

    for (const songId of new Set(oldEntries.map((entry) => entry.resourceId))) {
      if (prepared.resources.has(songId)) continue;
      if (await db.listResources.where("resourceId").equals(songId).count()) continue;

      await db.resources.delete(songId);
    }

    log.info("Playlist refreshed", {
      id,
      durationMs: Math.round(performance.now() - writeStartedAt),
    });
  });
}
