import type { DbListIdentifier } from "#layers/libcore/app/database/types";

export default function useLibraryList<L extends DbListIdentifier>(id: MaybeRefOrGetter<L>) {
  const library = useLibrary();

  return useLibraryQuery({
    key: () => ["list", toValue(id)],
    query: () => library.client.getListResources<L>(toValue(id)),
  });
}
