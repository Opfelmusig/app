import type { OpfelMusigClient } from "@opfelmusig/lib";

import { parseCatalogPlaylist } from "#layers/amdata/app/lib/parsers/playlists";
import { parseProfile } from "#layers/amdata/app/lib/parsers/profiles";
import { catalogPlaylistsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export async function fetchSocialProfile(client: OpfelMusigClient, handle: string) {
  const response = await client.social.profiles.getByHandle(handle, {
    scopes: {
      ...catalogPlaylistsScopes,
      "social-profiles": {
        fields: ["name", "handle", "artwork", "isPrivate", "isVerified"],
        relationships: {
          "shared-playlists": "include",
        },
      },
    },
  });

  const profile = response.data[0];
  if (!hasResourceName(profile)) return null;

  let collection = profile.relationships?.["shared-playlists"];
  const playlists = [...(collection?.data ?? [])];

  while (collection?.next) {
    collection = await client.social.profiles.getRelationship(profile.id, "shared-playlists", {
      offset: playlists.length,
      limit: 100,
      scopes: catalogPlaylistsScopes,
    });
    playlists.push(...collection.data);
    if (!collection.data.length) break;
  }

  return {
    profile: parseProfile(profile),
    sharedPlaylists: createListResources(
      playlists.filter(hasResourceName).map(parseCatalogPlaylist),
      `social-profiles:${profile.id}:shared-playlists`,
    ),
  };
}
