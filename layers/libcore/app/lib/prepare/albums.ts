import { parseResource } from "#layers/amdata/app/lib/parse";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { AlbumsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addAlbums(target: AppleMusicLibrary, resources: AlbumsScopes[], listId: string) {
  resources.forEach((resource, index) => addAlbum(target, resource, listId, index));
}

export function addAlbum(
  target: AppleMusicLibrary,
  resource: AlbumsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseResource(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}
