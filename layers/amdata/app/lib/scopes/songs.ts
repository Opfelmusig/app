import { defineScopes } from "@opfelmusig/lib";

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
