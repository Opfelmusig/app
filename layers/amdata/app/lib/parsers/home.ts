import { parseResource } from "#layers/amdata/app/lib/parsers";
import { getUnknownProperty } from "#layers/amdata/app/lib/parsers/helpers";
import type { MeRecommendationScopes } from "#layers/amdata/app/lib/scopes/home";

type Content = NonNullable<MeRecommendationScopes["relationships"]>["contents"]["data"][number];

type FlatContent = Exclude<Content, { type: "personal-recommendation" }>;

function flattenRecommendations(items?: readonly Content[]): FlatContent[] {
  if (!items) return [];

  return items.flatMap((item): FlatContent[] =>
    item.type === "personal-recommendation"
      ? flattenRecommendations(item.relationships?.contents.data ?? [])
      : [item],
  );
}

export function parseMeRecommendation(resource: MeRecommendationScopes): AmMeRecommendation {
  const attributes = resource.attributes;
  const content = flattenRecommendations(resource.relationships?.contents.data)
    .filter(
      (resource) =>
        resource.type !== "editorial-items" &&
        resource.type !== "concerts" &&
        resource.type !== "music-videos" &&
        resource.type !== "library-music-videos",
    )
    .filter(hasResourceName);

  if (!attributes)
    throw new Error(`Invalid Apple Music recommendation: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "personal-recommendation",

    attributes: {
      hasSeeAll: attributes.hasSeeAll,
      kind: attributes.kind,
      reason: attributes.reason?.stringForDisplay,
      title: attributes.title?.stringForDisplay,
      resourceTypes: attributes.resourceTypes,
    },

    relationships: {
      content: content.map((item) => {
        const reason = getUnknownProperty(item.meta, "reason", "stringForDisplay");

        return {
          ...parseResource(item),
          shared: { reasonForDisplay: typeof reason === "string" ? reason : undefined },
        };
      }),
    },
  };
}
