import { defineScopes } from "@opfelmusig/lib";
import type { ScopedResourceOf } from "@opfelmusig/lib/types";

export const profileScope = defineScopes({
  "personal-social-profiles": {
    relationships: {
      "social-profile": "include",
    },
  },
});

export type UserProfile = ScopedResourceOf<"personal-social-profiles", typeof profileScope>;
