import { fetchLibraryPlaylistTracks } from "#layers/amdata/app/lib/queries/playlists";

export default function useLibraryPlaylistTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryPlaylistTracksOptions(id));
}

export function useLibraryPlaylistTracksOptions(id: MaybeRefOrGetter<string>) {
  return useAmQueryOptions({
    scope: "library",
    key: () => ["playlists", toValue(id), "tracks"],
    query: () => fetchLibraryPlaylistTracks(toValue(id)),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
