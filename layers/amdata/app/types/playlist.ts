import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmResource } from "#layers/amdata/app/types/resources";

export interface AmPlaylistAttributes {
  name: string;
  artwork?: Artwork;
  description?: string;
  lastModifiedDate?: Date;
  canEdit: boolean;
  isPublic: boolean;
  dateAdded?: Date;
  tags: readonly string[];
  curatorName?: string;
  curatorSocialHandle?: string;
  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;
}

export interface AmCatalogPlaylist extends AmResource {
  type: "playlists";
  attributes: AmPlaylistAttributes;
  libraryId?: string;
}

export interface AmLibraryPlaylist extends AmResource {
  type: "library-playlists";
  attributes: AmPlaylistAttributes;
  catalogId?: string;
  parentId: string;
}
