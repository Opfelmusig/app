import type { RecommendationKind } from "@opfelmusig/lib/types";

export type AmMeRecommendationContent = AmAlbum | AmPlaylist | AmArtist | AmCatalogStation;

export interface AmMeRecommendation extends AmResourceBase {
  type: "personal-recommendation";

  attributes: {
    hasSeeAll: boolean;
    kind: RecommendationKind;
    resourceTypes: readonly string[];
    reason?: string;
    title?: string;
  };

  relationships: {
    content: {
      reason?: string;
      item: AmMeRecommendationContent;
    }[];
  };
}
