import type {
  Artwork,
  AudioAnalysisLoudness,
  ContentRating,
  EditorialVideo,
  PlayParameters,
  RatingValue,
} from "@opfelmusig/lib/types";

export interface AmSongAttributes {
  name: string;
  artistName?: string;
  albumName?: string;
  genreNames: readonly string[];
  artwork?: Artwork;
  durationInMillis: number;
  playParams?: PlayParameters;
  discNumber?: number;
  trackNumber?: number;
  releaseDate?: string;
  contentRating?: ContentRating;
  personalRating?: RatingValue;
  editorialVideo?: EditorialVideo;
  loudness?: AudioAnalysisLoudness;
  popularity?: number;

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
