import type { Artwork, PlayParameters } from "@opfelmusig/lib/types";

import type { AmResourceBase } from "#layers/amdata/app/types/resources";

export interface AmCatalogStation extends AmResourceBase {
  type: "stations";

  attributes: {
    name: string;
    artwork?: Artwork;
    playParams?: PlayParameters;
  };
}
