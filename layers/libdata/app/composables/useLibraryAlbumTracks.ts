import { fetchLibraryAlbumTracks } from "#layers/libdata/app/lib/queries/albums";

export default function useLibraryAlbumTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryAlbumTracksOptions(id));
}

export function useLibraryAlbumTracksOptions(id: MaybeRefOrGetter<string>) {
  return useLibraryQueryOptions({
    key: () => ["albums", toValue(id), "tracks"],
    query: () => fetchLibraryAlbumTracks(toValue(id)),
    staleTime: ms("30m"),
  });
}
