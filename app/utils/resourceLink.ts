import type { ResourceTemplateOf, ResourceTypes } from "@opfelmusig/lib/types";

type LinkableResourceTypes = Exclude<
  ResourceTypes,
  "social-profiles" | "personal-social-profiles" | "stations" | "songs" | "library-songs"
>;

export type LinkableResource =
  | ResourceTemplateOf<LinkableResourceTypes>
  | ResourceTemplateOf<"social-profiles" | "personal-social-profiles", "handle">
  | ResourceTemplateOf<
      "songs" | "library-songs",
      never,
      never,
      { albums?: ResourceTemplateOf<"albums" | "library-albums"> }
    >;

export default function (resource?: LinkableResource | null) {
  if (!resource) return;

  switch (resource.type) {
    case "songs":
    case "library-songs": {
      const album = resource.relationships?.albums?.data[0];
      if (!album) return;
      return `/resources/${album.type}/${album.id}?song_id=${resource.id}`;
    }
    case "personal-social-profiles":
    case "social-profiles":
      return `/profile/${resource.attributes?.handle}`;
    default:
      return `/resources/${resource.type}/${resource.id}`;
  }
}
