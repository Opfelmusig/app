import { fetchLibraryAlbumTracks } from "#layers/libdata/app/lib/queries/albums";

export default function useLibraryAlbumTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryAlbumTracksOptions(id));
}

export function useLibraryAlbumTracksOptions(id: MaybeRefOrGetter<string>) {
  return useLibraryQueryOptions({
    key: () => ["albums", toValue(id), "tracks"],
    query: ({ signal }) => fetchLibraryAlbumTracks(toValue(id), signal),
    staleTime: ms("30m"),
  });
}
