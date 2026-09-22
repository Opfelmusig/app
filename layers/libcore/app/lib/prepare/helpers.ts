import type { DbResourceType, DbCatalogLinkType } from "#layers/libcore/app/database/types";
import { libraryCatalogLinkId, listResourceId } from "#layers/libcore/app/lib/prepare/ids";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addList(target: AppleMusicLibrary, listId: string) {
  if (target.lists.has(listId)) return;

  target.lists.set(listId, {
    id: listId,
  });
}

export function addResource(target: AppleMusicLibrary, resourceId: string, type: DbResourceType) {
  if (target.resources.has(resourceId)) return;

  target.resources.set(resourceId, {
    id: resourceId,
    type,
  });
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

export function addLibraryCatalogLink(
  target: AppleMusicLibrary,
  resourceId: string,
  type: DbCatalogLinkType,
  catalogId: string,
  name: string,
  position: number,
) {
  const id = libraryCatalogLinkId(resourceId, type, position);

  if (target.libraryCatalogLinks.has(id)) return;

  target.libraryCatalogLinks.set(id, {
    id: id,
    catalogId,
    type,
    name: name,
    position,
    resourceId: resourceId,
  });
}
