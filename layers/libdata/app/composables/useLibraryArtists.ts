import { fetchLibraryArtists } from "#layers/libdata/app/lib/queries/artists";

export default function useLibraryArtists() {
  return useLibraryQuery({
    key: () => ["artists"],
    query: () => fetchLibraryArtists(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
