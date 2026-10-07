import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/playlists";

type LibraryFolderTemplate = ResourceTemplateOf<
  "library-playlist-folders",
  "name" | "dateAdded",
  never,
  {
    parent: ResourceTemplateOf<"library-playlist-folders">;
  }
>;

export function parseLibraryPlaylistFolder(
  resource: LibraryFolderTemplate,
): AmLibraryPlaylistFolder {
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist folder: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-playlist-folders",

    attributes: {
      name: attributes.name,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
    },

    parentId: resource.relationships?.parent.data[0]?.id ?? ROOT_FOLDER_ID,
  };
}
