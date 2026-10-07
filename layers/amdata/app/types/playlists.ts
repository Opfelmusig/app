import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmResource } from "#layers/amdata/app/types/resources";

export interface AmPlaylistAttributes {
  name: string;
  artwork?: Artwork;
  description?: string;
  lastModifiedDate?: Date;
  curatorName?: string;
  curatorSocialHandle?: string;
  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;
}

export interface AmCatalogPlaylist extends AmResource {
  type: "playlists";
  attributes: AmPlaylistAttributes;

  extras: {
    libraryId?: string;
  };
}

export interface AmLibraryPlaylist extends AmResource {
  type: "library-playlists";
  attributes: AmPlaylistAttributes;

  extras: {
    tags: readonly string[];
    canEdit: boolean;
    isPublic: boolean;
    dateAdded?: Date;
    catalogId?: string;
    parentId: string;
  };
}

export type AmPlaylist = AmCatalogPlaylist | AmLibraryPlaylist;
