import { fetchLibraryAlbums } from "#layers/libdata/app/lib/queries/albums";

export default function useLibraryAlbums() {
  return useLibraryQuery({
    key: () => ["albums", "list"],
    query: ({ signal }) => fetchLibraryAlbums(signal),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
