import type { AmResource } from "#layers/amdata/app/types/resources";

export default function (type?: AmResource["type"] | null) {
  switch (type) {
    case "artists":
    case "library-artists":
      return "lucide:mic-vocal";
    case "playlists":
    case "library-playlists":
      return "lucide:list-music";
    case "library-playlist-folders":
      return "lucide:folder";
    case "albums":
    case "library-albums":
      return "lucide:disc";
    case "library-songs":
    case "songs":
      return "lucide:music-2";
    /* case "stations":
      return "lucide:radio"; */
    case "social-profiles":
      return "lucide:user";
    default:
      return "lucide:music";
  }
}
