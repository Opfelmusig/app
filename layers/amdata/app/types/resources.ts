import type { ResourceTypes } from "@opfelmusig/lib/types";

export interface AmResource {
  id: string;
  type: ResourceTypes;
}

export interface AmCatalogLink {
  id: string;
  name: string;
}
