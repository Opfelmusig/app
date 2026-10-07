import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

export default function useLibraryTree(rootId: MaybeRefOrGetter<string> = ROOT_FOLDER_ID) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "tree", toValue(rootId)],
    query: () => library.client.getFolderTree(toValue(rootId)),
    enabled: () => library.state.ready && !!toValue(rootId),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
