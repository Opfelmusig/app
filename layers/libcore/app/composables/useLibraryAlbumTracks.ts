export default function useLibraryAlbumTracks(id: MaybeRefOrGetter<string | undefined>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "albums", toValue(id) ?? null, "tracks"],
    query: () => library.client.getAlbumTracks(toValue(id)!),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
