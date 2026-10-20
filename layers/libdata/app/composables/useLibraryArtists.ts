import { fetchLibraryArtists } from "#layers/libdata/app/lib/queries/artists";

export default function useLibraryArtists() {
  return useLibraryQuery({
    key: () => ["artists"],
    query: () => fetchLibraryArtists(),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
