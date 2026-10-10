import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import { addResource } from "#layers/libcore/app/lib/prepare/resources";
import type { PlaylistFoldersScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addFolders(
  target: AppleMusicLibrary,
  resources: PlaylistFoldersScopes[],
  listId: string,
) {
  resources.forEach((resource, index) => {
    if (resource.id === ROOT_FOLDER_ID) return;

    addResource(target, resource, listId, index);
  });
}
