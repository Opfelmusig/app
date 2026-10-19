import { defineScopes } from "@opfelmusig/lib";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

export const librarySongsScopes = defineScopes({
  "library-songs": {
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
      "playParams",
    ],
    relationships: {
      albums: "relate",
      artists: "relate",
      catalog: "include",
    },
  },
  songs: {
    fields: ["name"],
    extend: ["personalRating"],
    relationships: {
      albums: "include",
      artists: "include",
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

export type LibrarySongsScopes = ScopedResourceOf<"library-songs", typeof librarySongsScopes>;

export const libraryAlbumsScopes = defineScopes({
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
  albums: {
    fields: ["name", "contentRating"],
    extend: ["editorialVideo", "personalRating"],
    relationships: {
      artists: "include",
    },
  },
  artists: {
    fields: ["name"],
  },
});

export type LibraryAlbumsScopes = ScopedResourceOf<"library-albums", typeof libraryAlbumsScopes>;

export const libraryArtistsScopes = defineScopes({
  "library-artists": {
    fields: ["name"],
    relationships: {
      catalog: "include",
    },
  },
  artists: {
    fields: ["name", "artwork", "genreNames"],
    extend: ["editorialArtwork", "personalRating"],
  },
});

export type LibraryArtistsScopes = ScopedResourceOf<"library-artists", typeof libraryArtistsScopes>;

export const libraryPlaylistsScopes = defineScopes({
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
  playlists: {
    fields: ["curatorName", "curatorSocialHandle", "lastModifiedDate"],
    extend: ["editorialVideo", "personalRating"],
  },
});

export type LibraryPlaylistsScopes = ScopedResourceOf<
  "library-playlists",
  typeof libraryPlaylistsScopes
>;

export const libraryArtworkScopes = defineScopes({
  "library-songs": { fields: ["artwork"], relationships: { catalog: "include" } },
  songs: { fields: ["artwork"] },
  "library-albums": { fields: ["artwork"], relationships: { catalog: "include" } },
  albums: { fields: ["artwork"] },
});
