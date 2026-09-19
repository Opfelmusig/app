export default function () {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "songs"],
    query: () => library.client.songs(),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
