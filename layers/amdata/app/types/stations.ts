import type { Artwork } from "@opfelmusig/lib/types";

export interface AmCatalogStation extends AmResourceBase {
  type: "stations";

  attributes: {
    name: string;
    artwork?: Artwork;
  };
}
