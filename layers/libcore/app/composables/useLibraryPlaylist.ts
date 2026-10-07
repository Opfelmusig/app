export default function useLibraryPlaylist(id: MaybeRefOrGetter<string | undefined>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "playlist", toValue(id) ?? null],
    query: () => library.client.getPlaylist(toValue(id)!),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
