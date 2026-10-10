import { parseResource, type Templates } from "#layers/amdata/app/lib/parse";
import type { DbResourceType } from "#layers/libcore/app/database/types";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

type LibraryResourceTemplate = Extract<Templates, { type: DbResourceType }>;

export function addResources(
  target: AppleMusicLibrary,
  resources: LibraryResourceTemplate[],
  listId: string,
) {
  resources.forEach((resource, index) => addResource(target, resource, listId, index));
}

export function addResource(
  target: AppleMusicLibrary,
  resource: LibraryResourceTemplate,
  listId: string,
  position: number,
) {
  const parsed = parseResource(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}
