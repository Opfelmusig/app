import { defineScopes } from "@opfelmusig/lib/helpers";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

import { parseResource } from "#layers/amdata/app/lib/parsers";
import { getMeta } from "#layers/amdata/app/lib/parsers/helpers";

export const homeScopes = defineScopes({
  "personal-recommendation": {
    fields: ["hasSeeAll", "kind", "reason", "resourceTypes", "title"],
    relationships: {
      contents: { mode: "include", limit: 100 },
    },
  },

  albums: {
    fields: ["name", "artistName", "artwork", "genreNames", "releaseDate", "contentRating"],
    extend: ["personalRating", "editorialVideo"],
    relationships: {
      artists: "include",
      library: "relate",
    },
  },

  "library-albums": {
    fields: [
      "name",
      "artistName",
      "artwork",
      "dateAdded",
      "genreNames",
      "releaseDate",
      "contentRating",
    ],
    relationships: {
      artists: "relate",
      catalog: "include",
    },
  },

  artists: {
    fields: ["name", "artwork", "genreNames"],
    extend: ["personalRating", "editorialArtwork"],
  },

  "library-artists": {
    fields: ["name"],
    relationships: {
      catalog: "include",
    },
  },

  playlists: {
    fields: [
      "name",
      "artwork",
      "description",
      "curatorName",
      "curatorSocialHandle",
      "lastModifiedDate",
    ],
    extend: ["personalRating", "editorialVideo"],
    relationships: {
      library: "relate",
    },
  },

  "library-playlists": {
    fields: [
      "name",
      "artwork",
      "canEdit",
      "dateAdded",
      "description",
      "isPublic",
      "lastModifiedDate",
    ],
    extend: ["tags"],
    relationships: {
      catalog: "include",
      parent: "relate",
    },
  },

  stations: {
    fields: ["name", "artwork"],
  },
});

export type MeRecommendationScopes = ScopedResourceOf<"personal-recommendation", typeof homeScopes>;

type Content = NonNullable<MeRecommendationScopes["relationships"]>["contents"]["data"][number];

type FlatContent = Exclude<Content, { type: "personal-recommendation" }>;

function flattenRecommendations(items?: readonly Content[]): FlatContent[] {
  if (!items) return [];

  return items.flatMap((item): FlatContent[] =>
    item.type === "personal-recommendation"
      ? flattenRecommendations(item.relationships?.contents.data ?? [])
      : [item],
  );
}

export function parseMeRecommendation(resource: MeRecommendationScopes): AmMeRecommendation {
  const attributes = resource.attributes;
  const content = flattenRecommendations(resource.relationships?.contents.data)
    .filter(
      (resource) =>
        resource.type !== "editorial-items" &&
        resource.type !== "concerts" &&
        resource.type !== "music-videos" &&
        resource.type !== "library-music-videos",
    )
    .filter(hasResourceName);

  if (!attributes)
    throw new Error(`Invalid Apple Music recommendation: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "personal-recommendation",

    attributes: {
      hasSeeAll: attributes.hasSeeAll,
      kind: attributes.kind,
      reason: attributes.reason?.stringForDisplay,
      title: attributes.title?.stringForDisplay,
      resourceTypes: attributes.resourceTypes,
    },

    relationships: {
      content: createListResources(
        content.map((item) => {
          const reason = getMeta(item.meta, "reason", "stringForDisplay");

          return {
            ...parseResource(item),
            shared: { reasonForDisplay: typeof reason === "string" ? reason : undefined },
          };
        }),
        `home:${resource.id}`,
      ),
    },
  };
}
