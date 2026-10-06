import type { Artwork, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmResource } from "#layers/amdata/app/types/resources";

export interface AmArtistAttributes {
  name: string;
  artwork?: Artwork;
  genreNames: readonly string[];
  editorialVideo?: EditorialVideo;
  personalRating?: RatingValue;
}

export interface AmCatalogArtist extends AmResource {
  type: "artists";
  attributes: AmArtistAttributes;
  libraryId?: string;
}

export interface AmLibraryArtist extends AmResource {
  type: "library-artists";
  attributes: AmArtistAttributes;
  catalogId?: string;
}
