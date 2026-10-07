export default function useLibraryArtistAlbums(id: MaybeRefOrGetter<string | undefined>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "artist", toValue(id) ?? null, "albums"],
    query: () => library.client.getArtistAlbums(toValue(id)!),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
