import { listResourceId } from "#layers/libcore/app/lib/prepare/ids";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function createEmptyLibrary(): AppleMusicLibrary {
  return {
    resources: new Map(),
    listResources: new Map(),
  };
}

export function addListResource(
  target: AppleMusicLibrary,
  resourceId: string,
  listId: string,
  position: number,
) {
  const id = listResourceId(listId, position);

  if (target.listResources.has(id)) return;

  target.listResources.set(id, {
    id: id,
    resourceId: resourceId,
    listId,
    position: position,
  });
}
