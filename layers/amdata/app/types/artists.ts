import type { Artwork, EditorialArtwork, RatingValue } from "@opfelmusig/lib/types";

import type { AmResourceBase } from "#layers/amdata/app/types/resources";

export interface AmArtistAttributes {
  name: string;
  artwork?: Artwork;
  genreNames: readonly string[];
  editorialArtwork?: EditorialArtwork;
  personalRating?: RatingValue;
}

export interface AmCatalogArtist extends AmResourceBase {
  type: "artists";
  attributes: AmArtistAttributes;

  extras: {
    libraryId?: string;
  };
}

export interface AmLibraryArtist extends AmResourceBase {
  type: "library-artists";
  attributes: AmArtistAttributes;

  extras: {
    catalogId?: string;
  };
}

export type AmArtist = AmCatalogArtist | AmLibraryArtist;
