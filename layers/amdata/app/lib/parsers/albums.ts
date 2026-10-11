import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import { parseCatalogLinks } from "#layers/amdata/app/lib/parsers/helpers";
import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";

export type LibraryAlbumTemplate = ResourceTemplateOf<
  "library-albums",
  "name" | "artistName" | "artwork" | "dateAdded" | "genreNames" | "releaseDate" | "contentRating",
  never,
  {
    artists: ResourceTemplateOf<"library-artists">;
    catalog: ResourceTemplateOf<
      "albums",
      "contentRating",
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
      contentRating: attributes.contentRating ?? catalog?.attributes?.contentRating,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,

      artists: parseCatalogLinks(catalog?.relationships?.artists.data),
    },

    extras: {
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
      artistId: artist?.id,
      catalogId: catalog?.id,
    },
  };
}
