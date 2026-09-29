export default function useLibrarySongs() {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "albums"],
    query: () => library.client.albums(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
