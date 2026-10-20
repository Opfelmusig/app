import { fetchLibraryAlbums } from "#layers/libdata/app/lib/queries/albums";

export default function useLibraryAlbums() {
  return useLibraryQuery({
    key: () => ["albums"],
    query: ({ signal }) => fetchLibraryAlbums(signal),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
