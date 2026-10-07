import { parseLibrarySong } from "#layers/amdata/app/lib/songs";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addSongs(target: AppleMusicLibrary, resources: SongsScopes[], listId: string) {
  resources.forEach((resource, index) => addSong(target, resource, listId, index));
}

export function addSong(
  target: AppleMusicLibrary,
  resource: SongsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseLibrarySong(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}
