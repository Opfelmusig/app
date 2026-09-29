export default function useLibrarySongs() {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "artists"],
    query: () => library.client.artists(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
