export function hasResourceName<T extends { attributes?: { name?: string } }>(
  resource: T | undefined,
): resource is T & { attributes: { name: string } } {
  return !!resource?.attributes?.name;
}
