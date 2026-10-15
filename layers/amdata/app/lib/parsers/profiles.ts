import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { CatalogPlaylistTemplate } from "#layers/amdata/app/lib/parsers/playlists";

export type SocialProfileTemplate = ResourceTemplateOf<
  "social-profiles",
  "name" | "handle" | "artwork" | "isPrivate" | "isVerified"
>;
export type PersonalSocialProfileTemplate = ResourceTemplateOf<
  "personal-social-profiles",
  "name" | "handle" | "artwork" | "isPrivate" | "isVerified",
  never,
  {
    "social-profile": SocialProfileTemplate;
    "shared-playlists": CatalogPlaylistTemplate;
  }
>;

export function parseProfile(resource: ProfileTemplate): AmSocialProfile {
  const profile =
    resource.type === "social-profiles"
      ? resource
      : resource.relationships?.["social-profile"].data[0];
  const attributes = profile?.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music profile: ${resource.id}: missing attributes`);

  return {
    id: profile.id ?? resource.id,
    type: "social-profiles",

    attributes: {
      name: resource.attributes?.name ?? attributes.name,
      handle: resource.attributes?.handle ?? attributes.handle,
      artwork: resource.attributes?.artwork ?? attributes.artwork,
      isPrivate: resource.attributes?.isPrivate ?? attributes.isPrivate,
      isVerified: resource.attributes?.isVerified ?? attributes.isVerified,
    },
  };
}

export type ProfileTemplate = SocialProfileTemplate | PersonalSocialProfileTemplate;
