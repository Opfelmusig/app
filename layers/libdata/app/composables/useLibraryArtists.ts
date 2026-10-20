import { fetchLibraryArtists } from "#layers/libdata/app/lib/queries/artists";

export default function useLibraryArtists() {
  return useLibraryQuery({
    key: () => ["artists", "list"],
    query: ({ signal }) => fetchLibraryArtists(signal),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
