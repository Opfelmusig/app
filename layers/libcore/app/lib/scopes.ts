import { defineScopes } from "@opfelmusig/lib";
import type {
  LibraryPlaylistFolderTreeScopes,
  PinnableResourceTypes,
  ScopedResourceOf,
} from "@opfelmusig/lib/types";

export const songsScopes = defineScopes({
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
      albums: "include",
      artists: "include",
    },
  },
  albums: {
    fields: ["name"],
  },
  artists: {
    fields: ["name"],
  },
});

export type SongsScopes = ScopedResourceOf<"library-songs", typeof songsScopes>;

export const albumsScopes = defineScopes({
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
  artists: {
    fields: ["name"],
  },
});

export type AlbumsScopes = ScopedResourceOf<"library-albums", typeof albumsScopes>;

export const artistsScopes = defineScopes({
  "library-artists": {
    fields: ["name"],
    relationships: {
      catalog: "include",
    },
  },
  artists: {
    extend: ["editorialVideo", "personalRating"],
    fields: ["name", "artwork", "genreNames"],
  },
});

export type ArtistsScopes = ScopedResourceOf<"library-artists", typeof artistsScopes>;

export const playlistsScopes = defineScopes({
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

export type PlaylistsScopes = ScopedResourceOf<"library-playlists", typeof playlistsScopes>;

export const pinsScopes = defineScopes({
  "library-songs": { fields: ["name"] },
  "library-albums": { fields: ["name"] },
  "library-artists": { fields: ["name"] },
  "library-playlists": { fields: ["name"] },
  "library-music-videos": { fields: ["name"] },
});

export type PinsScopes = ScopedResourceOf<
  Exclude<PinnableResourceTypes, "library-music-videos">,
  typeof pinsScopes
>;

export type PlaylistFoldersScopes = ScopedResourceOf<
  "library-playlist-folders",
  LibraryPlaylistFolderTreeScopes
>;
