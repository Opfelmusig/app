import type { Artwork, ContentRating, RatingValue } from "@opfelmusig/lib/types";

import type { AmCatalogLink, AmResource } from "#layers/amdata/app/types/resources";

export interface AmSongAttributes {
  name: string;
  artistName?: string;
  albumName?: string;
  genreNames: readonly string[];
  artwork?: Artwork;
  durationInMillis: number;
  discNumber?: number;
  trackNumber?: number;
  releaseDate?: string;
  contentRating?: ContentRating;
  personalRating?: RatingValue;

  albumId?: string;
  artistId?: string;

  albums: AmCatalogLink[];
  artists: AmCatalogLink[];
}

export interface AmCatalogSong extends AmResource {
  type: "songs";
  attributes: AmSongAttributes;
  libraryId?: string;
}

export interface AmLibrarySong extends AmResource {
  type: "library-songs";
  attributes: AmSongAttributes;
  catalogId?: string;
}
