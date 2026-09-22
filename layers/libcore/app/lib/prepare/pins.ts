import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { PinsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addPins(target: AppleMusicLibrary, resources: PinsScopes[], listId: string) {
  resources.forEach((resource, index) => addListResource(target, resource.id, listId, index));
}
