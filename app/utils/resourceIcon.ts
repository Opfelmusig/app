import type { ResourceTypes } from "@opfelmusig/lib/types";

export default function (type?: ResourceTypes | (string & {}) | null) {
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
    case "stations":
      return "lucide:radio";
    case "social-profiles":
    case "personal-social-profiles":
      return "lucide:user-x";
    default:
      return "lucide:music";
  }
}
