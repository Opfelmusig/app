import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/playlist";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
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
  if (resource.id === ROOT_FOLDER_ID) return;

  const parsed = parseFolder(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

function parseFolder(resource: PlaylistFoldersScopes): AmLibraryPlaylistFolder {
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist folder: ${resource.id}: missing attributes`);

  const parentId = resource.relationships?.parent.data[0]?.id ?? ROOT_FOLDER_ID;

  return {
    id: resource.id,
    type: "library-playlist-folders",

    attributes: {
      name: attributes.name,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
    },

    parentId,
  };
}
