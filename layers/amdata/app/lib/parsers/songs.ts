import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import { parseCatalogLinks } from "#layers/amdata/app/lib/parsers/helpers";
import type { AmCatalogSong, AmLibrarySong } from "#layers/amdata/app/types/songs";

type SongAttributeKeys =
  | "name"
  | "albumName"
  | "artistName"
  | "artwork"
  | "durationInMillis"
  | "genreNames"
  | "releaseDate"
  | "discNumber"
  | "trackNumber"
  | "contentRating";

export type LibrarySongTemplate = ResourceTemplateOf<
  "library-songs",
  SongAttributeKeys,
  never,
  {
    albums: ResourceTemplateOf<"library-albums">;
    artists: ResourceTemplateOf<"library-artists">;
    catalog: ResourceTemplateOf<
      "songs",
      never,
      "personalRating",
      {
        albums: ResourceTemplateOf<"albums", "name">;
        artists: ResourceTemplateOf<"artists", "name">;
      }
    >;
  }
>;

export function parseLibrarySong(resource: LibrarySongTemplate): AmLibrarySong {
  const catalog = resource.relationships?.catalog.data[0];
  const album = resource.relationships?.albums.data[0];
  const artist = resource.relationships?.artists.data[0];
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-songs",

    attributes: {
      name: attributes.name,
      albumName: attributes.albumName,
      artistName: attributes.artistName,
      genreNames: attributes.genreNames,
      artwork: attributes.artwork,
      durationInMillis: attributes.durationInMillis,
      discNumber: attributes.discNumber,
      trackNumber: attributes.trackNumber,
      releaseDate: attributes.releaseDate,
      contentRating: attributes.contentRating,
      personalRating: catalog?.attributes?.personalRating,

      albums: parseCatalogLinks(catalog?.relationships?.albums.data),
      artists: parseCatalogLinks(catalog?.relationships?.artists.data),
    },

    extras: {
      catalogId: catalog?.id,
      albumId: album?.id,
      artistId: artist?.id,
    },
  };
}

export type CatalogSongTemplate = ResourceTemplateOf<
  "songs",
  SongAttributeKeys,
  "personalRating",
  {
    albums: ResourceTemplateOf<"albums", "name">;
    artists: ResourceTemplateOf<"artists", "name">;
    library: ResourceTemplateOf<"library-songs">;
  }
>;

export function parseCatalogSong(resource: CatalogSongTemplate): AmCatalogSong {
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "songs",
    attributes: {
      name: attributes.name,
      albumName: attributes.albumName,
      artistName: attributes.artistName,
      genreNames: attributes.genreNames,
      artwork: attributes.artwork,
      durationInMillis: attributes.durationInMillis,
      discNumber: attributes.discNumber,
      trackNumber: attributes.trackNumber,
      releaseDate: attributes.releaseDate,
      contentRating: attributes.contentRating,
      personalRating: attributes.personalRating,
      albums: parseCatalogLinks(resource.relationships?.albums.data),
      artists: parseCatalogLinks(resource.relationships?.artists.data),
    },
    extras: {
      libraryId: resource.relationships?.library.data[0]?.id,
    },
  };
}

export type SongTemplate = LibrarySongTemplate | CatalogSongTemplate;
