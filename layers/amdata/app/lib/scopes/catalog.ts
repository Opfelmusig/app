import { defineScopes } from "@opfelmusig/lib";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

export const catalogSongsScopes = defineScopes({
  songs: {
    fields: [
      "name",
      "albumName",
      "artistName",
      "artwork",
      "durationInMillis",
      "genreNames",
      "releaseDate",
      "discNumber",
      "trackNumber",
      "contentRating",
    ],
    extend: ["personalRating"],
    relationships: {
      albums: "include",
      artists: "include",
      library: "relate",
      "audio-analysis": "include",
    },
  },
  albums: {
    fields: ["name"],
    extend: ["editorialVideo"],
  },
  artists: {
    fields: ["name"],
  },
  "audio-analysis": {
    fields: ["loudness"],
  },
});

export type CatalogSongsScopes = ScopedResourceOf<"songs", typeof catalogSongsScopes>;

export const catalogAlbumsScopes = defineScopes({
  albums: {
    fields: ["name", "artistName", "artwork", "genreNames", "releaseDate", "contentRating"],
    extend: ["personalRating", "editorialVideo"],
    relationships: {
      artists: "include",
      library: "relate",
    },
  },
  artists: {
    fields: ["name"],
  },
});

export type CatalogAlbumsScopes = ScopedResourceOf<"albums", typeof catalogAlbumsScopes>;

export const catalogArtistsScopes = defineScopes({
  artists: {
    fields: ["name", "artwork", "genreNames"],
    extend: ["personalRating", "editorialArtwork"],
    relationships: {
      station: "include",
    },
  },
  stations: {
    fields: ["name", "artwork"],
  },
});

export type CatalogArtistsScopes = ScopedResourceOf<"artists", typeof catalogArtistsScopes>;

export const catalogPlaylistsScopes = defineScopes({
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
});

export type CatalogPlaylistsScopes = ScopedResourceOf<"playlists", typeof catalogPlaylistsScopes>;
