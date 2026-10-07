import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";

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
  }
>;

export function parseProfile(resource: ProfileTemplate): AmSocialProfile {
  const profile =
    resource.type === "social-profiles"
      ? resource
      : resource.relationships?.["social-profile"].data[0];
  const attributes = profile?.attributes;

  if (attributes) {
    return {
      id: resource.id,
      type: "social-profiles",

      attributes: {
        name: attributes?.name,
        handle: attributes?.handle,
        isPrivate: attributes.isPrivate,
        isVerified: attributes.isVerified,
      },
    };
  }

  if (!resource.attributes)
    throw new Error(`Invalid Apple Music profile: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "social-profiles",

    attributes: {
      name: resource.attributes.name,
      handle: resource.attributes.handle,
      artwork: resource.attributes.artwork,
      isPrivate: resource.attributes.isPrivate,
      isVerified: resource.attributes.isVerified,
    },
  };
}

export type ProfileTemplate = SocialProfileTemplate | PersonalSocialProfileTemplate;
