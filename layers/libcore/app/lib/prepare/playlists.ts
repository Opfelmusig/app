import { parseLibraryPlaylist } from "#layers/amdata/app/lib/playlists";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import type { PlaylistsScopes, SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addPlaylists(
  target: AppleMusicLibrary,
  resources: PlaylistsScopes[],
  listId: string,
) {
  resources.forEach((resource, index) => addPlaylist(target, resource, listId, index));
}

export function addPlaylist(
  target: AppleMusicLibrary,
  resource: PlaylistsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseLibraryPlaylist(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

export function addPlaylistTracks(
  target: AppleMusicLibrary,
  resources: Record<string, SongsScopes[]>,
) {
  const entries = Object.entries(resources);

  entries.forEach(([id, tracks]) => {
    const listId = playlistTracksListId(id);

    addSongs(target, tracks, listId);
  });
}
