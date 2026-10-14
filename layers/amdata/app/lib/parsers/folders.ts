import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

export type LibraryPlaylistFolderTemplate = ResourceTemplateOf<
  "library-playlist-folders",
  "name" | "dateAdded",
  never,
  {
    parent: ResourceTemplateOf<"library-playlist-folders">;
  }
>;

export function parseLibraryPlaylistFolder(
  resource: LibraryPlaylistFolderTemplate,
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

    extras: {
      parentId: resource.relationships?.parent.data[0]?.id ?? ROOT_FOLDER_ID,
    },
  };
}
