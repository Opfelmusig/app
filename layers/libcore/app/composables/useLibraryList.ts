import type { DbListId } from "#layers/libcore/app/database/types";

export default function useLibrarySongs<L extends DbListId>(id: MaybeRefOrGetter<L>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "list", toValue(id)],
    query: () => library.client.getListResources<L>(toValue(id)),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
