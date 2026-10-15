import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import type { LibraryPlaylistFoldersScopes } from "#layers/amdata/app/lib/scopes/library";
import { addResource } from "#layers/libcore/app/lib/prepare/resources";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addFolders(
  target: AppleMusicLibrary,
  resources: LibraryPlaylistFoldersScopes[],
  listId: string,
) {
  resources.forEach((resource, index) => {
    if (resource.id === ROOT_FOLDER_ID) return;

    addResource(target, resource, listId, index);
  });
}
