import { fetchLibraryPlaylistTracks } from "#layers/libdata/app/lib/queries/playlists";

export default function useLibraryPlaylistTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryPlaylistTracksOptions(id));
}

export function useLibraryPlaylistTracksOptions(id: MaybeRefOrGetter<string>) {
  return useLibraryQueryOptions({
    key: () => ["playlists", "tracks", toValue(id)],
    query: ({ signal }) => fetchLibraryPlaylistTracks(toValue(id), signal),
    staleTime: ms("1h"),
    gcTime: false,
  });
}
