export default function () {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "stats"],
    query: () => library.client.stats(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
