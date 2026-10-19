import { fetchLibraryArtists } from "#layers/amdata/app/lib/queries/artists";

export default function useLibraryArtists() {
  return useAmQuery({
    scope: "library",
    key: () => ["artists"],
    query: () => fetchLibraryArtists(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
