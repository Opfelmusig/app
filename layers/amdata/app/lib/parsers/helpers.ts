import { filter, map, pipe } from "remeda";

export function parseCatalogLinks(
  resources: readonly { id: string; attributes?: { name?: string } }[] | undefined,
): AmCatalogLink[] {
  return pipe(
    resources ?? [],
    filter(hasResourceName),
    map((resource) => ({
      id: resource.id,
      name: resource.attributes.name,
    })),
  );
}

export function getUnknownProperty(source: unknown, ...path: string[]): unknown {
  let value = source;

  for (const key of path) {
    if (typeof value !== "object" || value === null || !(key in value)) {
      return undefined;
    }

    value = (value as Record<string, unknown>)[key];
  }

  return value;
}
