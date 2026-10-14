export function createListResource<T extends AmResource>(
  resource: T,
  listId: string,
  position: number,
): AmListResource<T> {
  return {
    key: `${listId}:${position}:${resource.id}`,
    type: "list-resources",
    position,
    resourceType: resource.type,
    resource,
  } as AmListResource<T>;
}

export function createListResources<T extends AmResource>(
  resources: readonly T[],
  listId: string,
): AmListResource<T>[] {
  return resources.map((resource, position) => createListResource(resource, listId, position));
}
