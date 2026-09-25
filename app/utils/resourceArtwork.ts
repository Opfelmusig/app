import type {
  ResourceTemplateOf,
  ValidateResourceName,
  ResourceTypes,
} from "@opfelmusig/lib/types";

export type ResourcesWithArtworkTypes = ValidateResourceName<
  | "songs"
  | "artists"
  | "playlists"
  | "albums"
  | "activities"
  | "curators"
  | "record-labels"
  | "stations"
  | "social-profiles"
  | "personal-social-profiles"
  | "credit-artists"
>;

export type ResourcesWithoutArtworkTypes = Exclude<
  ResourceTypes,
  | ResourcesWithArtworkTypes
  | "library-artists"
  | "library-songs"
  | "library-playlists"
  | "library-albums"
>;

export type ResourcesWithoutArtwork = ResourceTemplateOf<ResourcesWithoutArtworkTypes>;

export type ResourcesWithArtwork =
  | ResourceTemplateOf<ResourcesWithArtworkTypes, "artwork">
  | ResourceTemplateOf<
      "library-artists",
      never,
      never,
      {
        catalog: ResourceTemplateOf<"artists", "artwork">;
      }
    >
  | ResourceTemplateOf<
      "library-songs" | "library-playlists" | "library-albums",
      "artwork",
      never,
      {
        catalog?: ResourceTemplateOf<"songs" | "playlists" | "albums", "artwork">;
      }
    >;

export type ResourceArtworkExtract = ResourcesWithoutArtwork | ResourcesWithArtwork;

export default function (resource?: ResourceArtworkExtract | null) {
  switch (resource?.type) {
    case "library-artists":
      return resource.relationships?.catalog.data[0]?.attributes?.artwork;
    case "library-songs":
    case "library-playlists":
    case "library-albums":
      return (
        resource?.attributes?.artwork ??
        resource.relationships?.catalog?.data[0]?.attributes?.artwork
      );
    case "songs":
    case "artists":
    case "playlists":
    case "albums":
    case "activities":
    case "curators":
    case "record-labels":
    case "stations":
    case "social-profiles":
    case "personal-social-profiles":
    case "credit-artists":
      return resource?.attributes?.artwork;
  }

  return;
}
