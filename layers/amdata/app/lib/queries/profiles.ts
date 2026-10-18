import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { parseCatalogPlaylist } from "#layers/amdata/app/lib/parsers/playlists";
import { parseProfile } from "#layers/amdata/app/lib/parsers/profiles";
import { catalogPlaylistsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchSocialProfile(client: OpfelMusigClient, handle: string) {
  const response = await client.social.profiles.getByHandle(handle, {
    scopes: {
      "social-profiles": {
        fields: ["name", "handle", "artwork", "isPrivate", "isVerified"],
      },
    },
  });

  const profile = response.data[0];
  if (!hasResourceName(profile)) return null;

  return parseProfile(profile);
}

export async function fetchSocialProfileSharedPlaylists(client: OpfelMusigClient, id: string) {
  const playlists = await collect(
    client.social.profiles.iterateRelationship(id, "shared-playlists", {
      limit: 100,
      scopes: catalogPlaylistsScopes,
    }),
  );

  return createListResources(
    playlists.filter(hasResourceName).map(parseCatalogPlaylist),
    `social-profiles:${id}:shared-playlists`,
  );
}
