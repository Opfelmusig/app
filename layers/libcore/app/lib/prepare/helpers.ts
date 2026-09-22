import type { DbResourceType, DbCatalogLinkType } from "#layers/libcore/app/database/types";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addList(target: AppleMusicLibrary, id: string) {
  target.lists.push({
    id,
  });
}

export function addResource(target: AppleMusicLibrary, id: string, type: DbResourceType) {
  target.resources.push({
    id,
    type,
  });
}

export function addListResource(
  target: AppleMusicLibrary,
  id: string,
  listId: string,
  position: number,
) {
  target.listResources.push({
    id: `${id}-${listId}-${position}`,
    resourceId: id,
    listId,
    position: position,
  });
}

export function addLibraryCatalogLink(
  target: AppleMusicLibrary,
  id: string,
  type: DbCatalogLinkType,
  catalogId: string,
  name: string,
  position: number,
) {
  target.libraryCatalogLinks.push({
    id: `${id}-artist-${catalogId}-${position}`,
    catalogId,
    type,
    name: name,
    position,
    resourceId: id,
  });
}
