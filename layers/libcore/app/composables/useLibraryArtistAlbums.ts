export default function useLibraryArtistAlbums(id: MaybeRefOrGetter<string>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "artist", toValue(id), "albums"],
    query: () => library.client.getArtistAlbums(toValue(id)),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
