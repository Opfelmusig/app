import { fetchLibraryAlbums } from "#layers/libdata/app/lib/queries/albums";

export default function useLibraryAlbums() {
  return useLibraryQuery({
    key: () => ["albums"],
    query: () => fetchLibraryAlbums(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
