import type { Artwork, ContentRating, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmCatalogLink, AmResourceBase } from "#layers/amdata/app/types/resources";

export interface AmAlbumAttributes {
  name: string;
  artistName?: string;
  genreNames: readonly string[];
  artwork?: Artwork;
  releaseDate?: string;
  contentRating?: ContentRating;
  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;

  artists: AmCatalogLink[];
}

export interface AmCatalogAlbum extends AmResourceBase {
  type: "albums";
  attributes: AmAlbumAttributes;

  extras: {
    libraryId?: string;
  };
}

export interface AmLibraryAlbum extends AmResourceBase {
  type: "library-albums";
  attributes: AmAlbumAttributes;

  extras: {
    dateAdded?: Date;
    artistId?: string;
    catalogId?: string;
  };
}

export type AmAlbum = AmCatalogAlbum | AmLibraryAlbum;
