export default function useLibraryPins() {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "pins"],
    query: () => library.client.pins(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
