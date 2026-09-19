import { defineScopes, type ScopedResourceOf } from "@opfelmusig/lib";

export const profileScope = defineScopes({
  "personal-social-profiles": {
    relationships: {
      "shared-playlists": "include",
      "social-profile": "include",
    },
  },
});

export type UserProfile = ScopedResourceOf<"personal-social-profiles", typeof profileScope>;
