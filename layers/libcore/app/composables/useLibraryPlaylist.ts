export default function useLibraryPlaylist(id: MaybeRefOrGetter<string>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "playlist", toValue(id)],
    query: () => library.client.getPlaylist(toValue(id)),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
