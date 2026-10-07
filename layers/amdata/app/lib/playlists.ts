import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmCatalogPlaylist, AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";

export type LibraryPlaylistTemplate = ResourceTemplateOf<
  "library-playlists",
  "name" | "artwork" | "canEdit" | "dateAdded" | "description" | "isPublic" | "lastModifiedDate",
  "tags",
  {
    catalog: ResourceTemplateOf<
      "playlists",
      "curatorName" | "curatorSocialHandle" | "lastModifiedDate",
      "personalRating" | "editorialVideo"
    >;
    parent: ResourceTemplateOf<"library-playlist-folders">;
  }
>;

export function parseLibraryPlaylist(resource: LibraryPlaylistTemplate): AmLibraryPlaylist {
  const catalog = resource.relationships?.catalog.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist: ${resource.id}: missing attributes`);

  const lastModifiedDate = catalog?.attributes?.lastModifiedDate ?? attributes.lastModifiedDate;

  return {
    id: resource.id,
    type: "library-playlists",

    attributes: {
      name: attributes.name,
      artwork: attributes.artwork,
      description: attributes.description?.standard,
      lastModifiedDate: lastModifiedDate ? new Date(lastModifiedDate) : undefined,
      curatorName: catalog?.attributes?.curatorName,
      curatorSocialHandle: catalog?.attributes?.curatorSocialHandle,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,
    },

    extras: {
      tags: attributes.tags ?? [],
      canEdit: attributes.canEdit,
      isPublic: attributes.isPublic,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
      catalogId: catalog?.id,
      parentId: resource.relationships?.parent.data[0]?.id ?? ROOT_FOLDER_ID,
    },
  };
}

export type CatalogPlaylistTemplate = ResourceTemplateOf<
  "playlists",
  "name" | "artwork" | "description" | "curatorName" | "curatorSocialHandle" | "lastModifiedDate",
  "personalRating" | "editorialVideo",
  {
    library: ResourceTemplateOf<"library-playlists">;
  }
>;

export function parseCatalogPlaylist(resource: CatalogPlaylistTemplate): AmCatalogPlaylist {
  const library = resource.relationships?.library.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "playlists",

    attributes: {
      name: attributes.name,
      artwork: attributes.artwork,
      description: attributes.description?.standard,
      lastModifiedDate: attributes.lastModifiedDate
        ? new Date(attributes.lastModifiedDate)
        : undefined,
      curatorName: attributes.curatorName,
      curatorSocialHandle: attributes.curatorSocialHandle,
      editorialVideo: attributes.editorialVideo,
      personalRating: attributes.personalRating,
    },

    extras: {
      libraryId: library?.id,
    },
  };
}

export type PlaylistTemplate = LibraryPlaylistTemplate | CatalogPlaylistTemplate;
