export default function useLibraryArtistAlbums(id: MaybeRefOrGetter<string>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "genre", toValue(id), "albums"],
    query: () => library.client.getGenreAlbums(toValue(id)),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
