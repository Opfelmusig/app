import type { DbFolder } from "#layers/libcore/app/database/types";
import { addList, addListResource, addResource } from "#layers/libcore/app/lib/prepare/helpers";
import { folderChildrenListId } from "#layers/libcore/app/lib/prepare/ids";
import type { PlaylistFoldersScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addFolders(
  target: AppleMusicLibrary,
  resources: PlaylistFoldersScopes[],
  listId: string,
) {
  resources.forEach((resource, index) => addFolder(target, resource, listId, index));
}

export function addFolder(
  target: AppleMusicLibrary,
  resource: PlaylistFoldersScopes,
  listId: string,
  position: number,
) {
  const parsed = parseFolder(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.folders.has(parsed.id)) return;

  target.folders.set(parsed.id, parsed);
  addResource(target, parsed.id, "folder");

  addList(target, parsed.childrenListId);
  resource.relationships?.children.data.forEach((child, index) =>
    addListResource(target, child.id, parsed.childrenListId, index),
  );
}

function parseFolder(resource: PlaylistFoldersScopes): DbFolder {
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist folder: ${resource.id}: missing attributes`);

  return {
    id: resource.id,

    name: attributes.name,
    dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,

    childrenListId: folderChildrenListId(resource.id),
  };
}
