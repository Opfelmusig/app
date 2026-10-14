import type { Artwork } from "@opfelmusig/lib/types";

export interface AmSocialProfile extends AmResourceBase {
  type: "social-profiles";
  attributes: {
    name: string;
    handle: string;
    artwork?: Artwork;
    isPrivate: boolean;
    isVerified: boolean;
  };
}
