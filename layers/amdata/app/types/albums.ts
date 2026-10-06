import type { Artwork, ContentRating, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmCatalogLink, AmResource } from "#layers/amdata/app/types/resources";

export interface AmAlbumAttributes {
  name: string;
  artistName?: string;
  genreNames: readonly string[];
  artwork?: Artwork;
  releaseDate?: string;
  dateAdded?: Date;
  contentRating?: ContentRating;
  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;

  artistId?: string;

  artists: AmCatalogLink[];
}

export interface AmCatalogAlbum extends AmResource {
  type: "albums";
  attributes: AmAlbumAttributes;
  libraryId?: string;
}

export interface AmLibraryAlbum extends AmResource {
  type: "library-albums";
  attributes: AmAlbumAttributes;
  catalogId?: string;
}
