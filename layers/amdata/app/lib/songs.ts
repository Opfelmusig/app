import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmLibrarySong } from "#layers/amdata/app/types/songs";

export type LibrarySongTemplate = ResourceTemplateOf<
  "library-songs",
  | "name"
  | "albumName"
  | "artistName"
  | "artwork"
  | "durationInMillis"
  | "genreNames"
  | "releaseDate"
  | "discNumber"
  | "trackNumber"
  | "contentRating",
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

      albums:
        catalog?.relationships?.albums.data.map((album) => ({
          id: album.id,
          name: album.attributes?.name ?? "Unknown",
        })) ?? [],
      artists:
        catalog?.relationships?.artists.data.map((artist) => ({
          id: artist.id,
          name: artist.attributes?.name ?? "Unknown",
        })) ?? [],
    },

    extras: {
      catalogId: catalog?.id,
      albumId: album?.id,
      artistId: artist?.id,
    },
  };
}

export type SongTemplate = LibrarySongTemplate;
