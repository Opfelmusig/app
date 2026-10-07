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

export interface AmLibraryPlaylistFolder extends AmResource {
  type: "library-playlist-folders";
  attributes: {
    name: string;
    dateAdded?: Date;
  };

  extras: {
    parentId: string;
  };
}

export interface AmLibraryTreePlaylist {
  type: "library-playlists";
  item: AmLibraryPlaylist;
}

export interface AmLibraryTreePlaylistFolder {
  type: "library-playlist-folders";
  item: AmLibraryPlaylistFolder;
  children: AmLibraryTreeNode[];
}

export type AmLibraryTreeNode = AmLibraryTreePlaylist | AmLibraryTreePlaylistFolder;
