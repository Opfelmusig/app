import type { ResourceTemplateOf } from "@opfelmusig/lib/types";

import type { AmCatalogStation } from "#layers/amdata/app/types/stations";

export type CatalogStationTemplate = ResourceTemplateOf<"stations", "name" | "artwork">;

export function parseCatalogStation(resource: CatalogStationTemplate): AmCatalogStation {
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music station: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "stations",

    attributes: {
      name: attributes.name,
      artwork: attributes.artwork,
    },
  };
}
