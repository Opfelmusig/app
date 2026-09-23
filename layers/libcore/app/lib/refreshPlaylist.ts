import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect, isNotResourceType } from "@opfelmusig/lib/helpers";

import type { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import { createEmptyLibrary } from "#layers/libcore/app/lib/prepare/helpers";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import { parsePlaylist } from "#layers/libcore/app/lib/prepare/playlists";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import { playlistsScopes, songsScopes } from "#layers/libcore/app/lib/scopes";

export async function refreshPlaylist(id: string, db: LibraryDatabase, client: OpfelMusigClient) {
  const playlist = await db.playlists.get(id);

  if (!playlist?.catalogId || playlist.canEdit) return;

  const result = await client.library.playlists.get(id, {
    scopes: playlistsScopes,
  });

  const newPlaylist = result.data[0];
  if (!newPlaylist?.attributes) return;

  const updatedPlaylist = parsePlaylist(newPlaylist);
  const newLastModifiedDate = updatedPlaylist.lastModifiedDate;

  if (!newLastModifiedDate || Number.isNaN(newLastModifiedDate.getTime())) return;
  if (
    playlist.lastModifiedDate &&
    playlist.lastModifiedDate.getTime() === newLastModifiedDate.getTime()
  )
    return;

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

  await db.transaction(
    "rw",
    [db.playlists, db.listResources, db.songs, db.resources, db.libraryCatalogLinks],
    async () => {
      const currentPlaylist = await db.playlists.get(id);
      if (!currentPlaylist?.catalogId || currentPlaylist.canEdit) return;
      if (
        currentPlaylist.catalogId !== playlist.catalogId ||
        currentPlaylist.lastModifiedDate?.getTime() !== playlist.lastModifiedDate?.getTime()
      )
        return;

      const oldEntries = await db.listResources.where("listId").equals(listId).toArray();

      await db.listResources.where("listId").equals(listId).delete();
      await db.playlists.put(updatedPlaylist);
      await db.songs.bulkPut([...prepared.songs.values()]);
      await db.resources.bulkPut([...prepared.resources.values()]);

      for (const songId of prepared.songs.keys()) {
        await db.libraryCatalogLinks.where("resourceId").equals(songId).delete();
      }
      await db.libraryCatalogLinks.bulkPut([...prepared.libraryCatalogLinks.values()]);
      await db.listResources.bulkPut([...prepared.listResources.values()]);

      for (const songId of new Set(oldEntries.map((entry) => entry.resourceId))) {
        if (prepared.songs.has(songId)) continue;
        if (await db.listResources.where("resourceId").equals(songId).count()) continue;

        await db.libraryCatalogLinks.where("resourceId").equals(songId).delete();
        await db.songs.delete(songId);
        await db.resources.delete(songId);
      }
    },
  );
}
