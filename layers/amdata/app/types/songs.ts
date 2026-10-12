import type { Artwork, ContentRating, EditorialVideo, RatingValue } from "@opfelmusig/lib/types";

import type { AmCatalogLink, AmResourceBase } from "#layers/amdata/app/types/resources";

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
  editorialVideo?: EditorialVideo;

  albums: AmCatalogLink[];
  artists: AmCatalogLink[];
}

export interface AmCatalogSong extends AmResourceBase {
  type: "songs";
  attributes: AmSongAttributes;

  extras: {
    libraryId?: string;
  };
}

export interface AmLibrarySong extends AmResourceBase {
  type: "library-songs";
  attributes: AmSongAttributes;

  extras: {
    catalogId?: string;
    albumId?: string;
    artistId?: string;
  };
}

export type AmSong = AmCatalogSong | AmLibrarySong;

export type SongColumns = "album" | "artist" | "genre" | "year" | "length";
export type SongSort =
  | "default"
  | "discAndTrackNumber"
  | "title"
  | "artist"
  | "album"
  | "year"
  | "length";
