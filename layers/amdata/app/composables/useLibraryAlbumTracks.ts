import { fetchLibraryAlbumTracks } from "#layers/amdata/app/lib/queries/albums";

export default function useLibraryAlbumTracks(id: MaybeRefOrGetter<string>) {
  return useQuery(useLibraryAlbumTracksOptions(id));
}

export function useLibraryAlbumTracksOptions(id: MaybeRefOrGetter<string>) {
  return useAmQueryOptions({
    scope: "library",
    key: () => ["albums", toValue(id), "tracks"],
    query: () => fetchLibraryAlbumTracks(toValue(id)),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
