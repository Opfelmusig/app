import type { OpfelMusigClient } from "@opfelmusig/lib";

import { parseResource } from "#layers/amdata/app/lib/parsers";
import { parseCatalogArtist } from "#layers/amdata/app/lib/parsers/artists";
import { getUnknownProperty } from "#layers/amdata/app/lib/parsers/helpers";
import {
  catalogAlbumsScopes,
  catalogArtistsScopes,
  catalogPlaylistsScopes,
  catalogSongsScopes,
} from "#layers/amdata/app/lib/scopes/catalog";

const artistViews = [
  "top-songs",
  "featured-albums",
  "full-albums",
  "singles",
  "live-albums",
  "compilation-albums",
  "appears-on-albums",
  "playlists",
  "similar-artists",
  "latest-release",
] as const;

export async function fetchCatalogArtist(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.artists.get(id, {
    scopes: {
      ...catalogSongsScopes,
      ...catalogAlbumsScopes,
      ...catalogPlaylistsScopes,
      artists: {
        ...catalogArtistsScopes.artists,
        views: {
          "top-songs": { limit: 6 },
          "featured-albums": { limit: 12 },
          "full-albums": { limit: 12 },
          singles: { limit: 12 },
          "live-albums": { limit: 12 },
          "compilation-albums": { limit: 12 },
          "appears-on-albums": { limit: 12 },
          playlists: { limit: 12 },
          "similar-artists": { limit: 12 },
          "latest-release": { limit: 1 },
        },
      },
    },
  });

  const artist = response.data[0];
  if (!hasResourceName(artist)) return null;

  return {
    artist: parseCatalogArtist(artist),
    views: artistViews.map((view) => {
      const collection = artist.views?.[view];
      const title = getUnknownProperty(collection?.attributes, "title");

      return {
        view,
        title: typeof title === "string" ? title : view,
        items: createListResources(
          (collection?.data ?? []).filter(hasResourceName).map((item) => parseResource(item)),
          `artists:${id}:${view}`,
        ),
      };
    }),
  };
}
