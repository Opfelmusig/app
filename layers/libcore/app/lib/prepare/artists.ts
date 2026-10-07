import { parseResource } from "#layers/amdata/app/lib/parse";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { ArtistsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addArtists(target: AppleMusicLibrary, resources: ArtistsScopes[], listId: string) {
  resources.forEach((resource, index) => addArtist(target, resource, listId, index));
}

export function addArtist(
  target: AppleMusicLibrary,
  resource: ArtistsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseResource(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}
