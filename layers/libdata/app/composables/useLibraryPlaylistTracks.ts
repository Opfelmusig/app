import { fetchLibraryPlaylistTracks } from "#layers/libdata/app/lib/queries/playlists";

export default function useLibraryPlaylistTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryPlaylistTracksOptions(id));
}

export function useLibraryPlaylistTracksOptions(id: MaybeRefOrGetter<string>) {
  return useLibraryQueryOptions({
    key: () => ["playlists", toValue(id), "tracks"],
    query: () => fetchLibraryPlaylistTracks(toValue(id)),
    staleTime: ms("6h"),
  });
}
