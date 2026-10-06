import type { DbListResource, DbResource } from "#layers/libcore/app/database/types";

export interface AppleMusicLibrary {
  resources: Map<string, DbResource>;
  listResources: Map<string, DbListResource>;
}
