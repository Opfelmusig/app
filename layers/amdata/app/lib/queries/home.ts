import type { OpfelMusigClient } from "@opfelmusig/lib";

import { homeScopes, parseMeRecommendation } from "#layers/amdata/app/lib/parsers/home";

export async function fetchHome(client: OpfelMusigClient) {
  const timezone = currentAppleTimezoneOffset();

  const recommendations = await client.me.recommendations.getDefault({
    limit: 25,
    scopes: homeScopes,
    config: {
      extraParams: {
        with: "friendsMix,library,social",
        timezone: timezone,
        platform: "web",
        name: "listen-now",
      },
    },
  });

  return recommendations.data
    .map(parseMeRecommendation)
    .filter(
      (recommendation) =>
        recommendation.attributes.kind !== "concerts-for-you" &&
        recommendation.relationships.content.length > 0,
    );
}

export async function fetchHomeShelf(client: OpfelMusigClient, shelf: string) {
  const response = await client.me.recommendations.getView(shelf, "see-all", {
    scopes: homeScopes,

    config: {
      extraParams: {
        name: "listen-now",
        platform: "web",
        timezone: currentAppleTimezoneOffset(),
        with: "friendsMix,library,social",
      },
    },
  });

  const recommendation = response.data[0];
  if (!recommendation) return null;

  const parsed = parseMeRecommendation(recommendation);
  return parsed.relationships.content;
}
