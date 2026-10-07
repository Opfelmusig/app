import type { Artwork } from "@opfelmusig/lib/types";

import type { AmResourceBase } from "#layers/amdata/app/types/resources";

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
