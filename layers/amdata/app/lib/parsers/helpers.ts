import type { AmCatalogLink } from "#layers/amdata/app/types/resources";

export function parseCatalogLinks(
  resources: readonly { id: string; attributes?: { name?: string } }[] | undefined,
): AmCatalogLink[] {
  return (
    resources?.map((resource) => ({
      id: resource.id,
      name: resource.attributes?.name ?? "Unknown",
    })) ?? []
  );
}
