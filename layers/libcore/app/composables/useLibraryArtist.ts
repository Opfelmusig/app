export default function useLibraryArtist(id: MaybeRefOrGetter<string>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "artist", toValue(id)],
    query: () => library.client.getArtist(toValue(id)),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
