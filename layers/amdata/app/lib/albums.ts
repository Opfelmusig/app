import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";

type LibraryAlbumTemplate = ResourceTemplateOf<
  "library-albums",
  "name" | "artistName" | "artwork" | "dateAdded" | "genreNames" | "releaseDate" | "contentRating",
  never,
  {
    artists: ResourceTemplateOf<"library-artists">;
    catalog: ResourceTemplateOf<
      "albums",
      never,
      "personalRating" | "editorialVideo",
      {
        artists: ResourceTemplateOf<"artists", "name">;
      }
    >;
  }
>;

export function parseLibraryAlbum(resource: LibraryAlbumTemplate): AmLibraryAlbum {
  const catalog = resource.relationships?.catalog.data[0];
  const artist = resource.relationships?.artists.data[0];
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music album: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-albums",

    attributes: {
      name: attributes.name,
      artistName: attributes.artistName,
      genreNames: attributes.genreNames,
      artwork: attributes.artwork,
      releaseDate: attributes.releaseDate,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
      contentRating: attributes.contentRating,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,
      artistId: artist?.id,

      artists:
        catalog?.relationships?.artists.data.map((artist) => ({
          id: artist.id,
          name: artist.attributes?.name ?? "Unknown",
        })) ?? [],
    },

    catalogId: catalog?.id,
  };
}
