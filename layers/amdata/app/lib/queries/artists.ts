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

export const artistViews = [
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

export type ArtistView = (typeof artistViews)[number];

const artistViewScopes = {
  ...catalogSongsScopes,
  ...catalogAlbumsScopes,
  ...catalogPlaylistsScopes,
  ...catalogArtistsScopes,
};

export async function fetchCatalogArtist(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.artists.get(id, {
    scopes: catalogArtistsScopes,
  });

  const artist = response.data[0];
  if (!hasResourceName(artist)) return null;

  return { artist: parseCatalogArtist(artist) };
}

export async function fetchCatalogArtistViews(client: OpfelMusigClient, id: string) {
  const response = await client.catalog.artists.get(id, {
    scopes: {
      ...artistViewScopes,
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
  if (!artist) return [];

  return artistViews.map((view) => {
    const collection = artist.views?.[view];
    const title = getUnknownProperty(collection?.attributes, "title");
    const items = createListResources(
      (collection?.data ?? []).filter(hasResourceName).map((item) => parseResource(item)),
      `artists:${id}:${view}`,
    );

    return {
      view,
      title: typeof title === "string" ? title : view,
      items,
      hasMore: !!collection?.next,
    };
  });
}

export async function fetchCatalogArtistView(
  client: OpfelMusigClient,
  id: string,
  view: ArtistView,
) {
  const response = await client.catalog.artists.getView(id, view, {
    limit: 100,
    scopes: artistViewScopes,
  });
  return createListResources(
    response.data.filter(hasResourceName).map((item) => parseResource(item)),
    `artists:${id}:${view}`,
  );
}
