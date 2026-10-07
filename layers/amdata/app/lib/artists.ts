import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";

type LibraryArtistTemplate = ResourceTemplateOf<
  "library-artists",
  "name",
  never,
  {
    catalog: ResourceTemplateOf<
      "artists",
      "artwork" | "genreNames",
      "personalRating" | "editorialArtwork"
    >;
  }
>;

export function parseLibraryArtist(resource: LibraryArtistTemplate): AmLibraryArtist {
  const catalog = resource.relationships?.catalog.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music artist: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-artists",

    attributes: {
      name: attributes.name,
      genreNames: catalog?.attributes?.genreNames ?? [],
      artwork: catalog?.attributes?.artwork,
      editorialArtwork: catalog?.attributes?.editorialArtwork,
      personalRating: catalog?.attributes?.personalRating,
    },

    extras: {
      catalogId: catalog?.id,
    },
  };
}
