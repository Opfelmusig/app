import { defineScopes } from "@opfelmusig/lib";

export const scopes = defineScopes({
  "library-songs": {
    fields: [
      "name",
      "albumName",
      "artistName",
      "artwork",
      "durationInMillis",
      "genreNames",
      "releaseDate",
      "trackNumber",
    ],
    relationships: {
      albums: "relate",
      artists: "relate",
      catalog: "include",
    },
  },
  songs: {
    fields: [
      "name",
      "albumName",
      "artistName",
      "artwork",
      "durationInMillis",
      "genreNames",
      "releaseDate",
      "trackNumber",
    ],
    extend: ["personalRating"],
    relationships: {
      albums: "relate",
      artists: "include",
    },
  },
  "library-albums": {
    fields: ["name", "artistName", "artwork", "dateAdded", "genreNames", "releaseDate"],
    relationships: {
      artists: "relate",
      catalog: "include",
    },
  },
  albums: {
    fields: ["name", "artistName", "artwork", "genreNames", "releaseDate"],
    extend: ["editorialVideo", "personalRating"],
    relationships: {
      artists: "include",
    },
  },
  "library-artists": {
    fields: ["name"],
    relationships: {
      catalog: "include",
    },
  },
  artists: {
    fields: ["name", "artwork", "genreNames"],
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
    },
  },
  playlists: {
    fields: [
      "name",
      "artwork",
      "curatorName",
      "curatorSocialHandle",
      "description",
      "lastModifiedDate",
    ],
    extend: ["editorialVideo", "personalRating"],
  },
});

export const emptyScopes = defineScopes({
  "library-songs": { fields: ["name"] },
  "library-albums": { fields: ["name"] },
  "library-artists": { fields: ["name"] },
  "library-playlists": { fields: ["name"] },
  "library-playlist-folders": { fields: ["name"] },
  "library-music-videos": { fields: ["name"] },
});
