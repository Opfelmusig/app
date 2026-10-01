export default function useLibraryGenres() {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "genres"],
    query: () => library.client.getGenres(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
