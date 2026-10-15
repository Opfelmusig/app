import { defineScopes } from "@opfelmusig/lib";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

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
