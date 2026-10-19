import { fetchLibraryAlbums } from "#layers/amdata/app/lib/queries/albums";

export default function useLibraryAlbums() {
  return useAmQuery({
    scope: "library",
    key: () => ["albums"],
    query: () => fetchLibraryAlbums(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
