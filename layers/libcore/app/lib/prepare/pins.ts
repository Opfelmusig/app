import type { LibraryPinsScopes } from "#layers/amdata/app/lib/scopes/library";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addPins(target: AppleMusicLibrary, resources: LibraryPinsScopes[], listId: string) {
  resources.forEach((resource, index) => addListResource(target, resource.id, listId, index));
}
