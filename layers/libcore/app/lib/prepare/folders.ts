import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import { parseLibraryPlaylistFolder } from "#layers/amdata/app/lib/folders";
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

  const parsed = parseLibraryPlaylistFolder(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}
