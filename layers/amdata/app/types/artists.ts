import type { Artwork, EditorialArtwork, RatingValue } from "@opfelmusig/lib/types";

import type { AmResource } from "#layers/amdata/app/types/resources";

export interface AmArtistAttributes {
  name: string;
  artwork?: Artwork;
  genreNames: readonly string[];
  editorialArtwork?: EditorialArtwork;
  personalRating?: RatingValue;
}

export interface AmCatalogArtist extends AmResource {
  type: "artists";
  attributes: AmArtistAttributes;

  extras: {
    libraryId?: string;
  };
}

export interface AmLibraryArtist extends AmResource {
  type: "library-artists";
  attributes: AmArtistAttributes;

  extras: {
    catalogId?: string;
  };
}
