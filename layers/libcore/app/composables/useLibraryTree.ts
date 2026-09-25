export default function useLibraryTree(rootId: MaybeRefOrGetter<string> = "p.playlistsroot") {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "tree", rootId],
    query: () => library.client.getFolderTree(toValue(rootId)),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
