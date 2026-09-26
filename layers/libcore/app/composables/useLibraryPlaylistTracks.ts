import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

export default function useLibraryPlaylist(id: MaybeRefOrGetter<string>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "playlist", toValue(id), "tracks"],
    query: () => library.client.getListResources(playlistTracksListId(toValue(id))),
    enabled: () => library.state.ready,
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
