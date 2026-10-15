import type { LibrarySongsScopes } from "#layers/amdata/app/lib/scopes/library";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import { addResources } from "#layers/libcore/app/lib/prepare/resources";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addPlaylistTracks(
  target: AppleMusicLibrary,
  resources: Record<string, LibrarySongsScopes[]>,
) {
  const entries = Object.entries(resources);

  entries.forEach(([id, tracks]) => {
    const listId = playlistTracksListId(id);

    addResources(target, tracks, listId);
  });
}
