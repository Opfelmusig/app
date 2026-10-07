import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

export default function useLibraryPlaylistTracks(id: MaybeRefOrGetter<string | undefined>) {
  const library = useLibrary();

  return useQuery({
    key: () => ["libcore", "playlist", toValue(id) ?? null, "tracks"],
    query: () => library.client.getListResources(playlistTracksListId(toValue(id)!)),
    enabled: () => library.state.ready && !!toValue(id),
    meta: { persist: false },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
