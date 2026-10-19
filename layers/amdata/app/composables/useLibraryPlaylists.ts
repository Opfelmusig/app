import { fetchLibraryPlaylists } from "#layers/amdata/app/lib/queries/playlists";

export default function useLibraryPlaylists() {
  return useAmQuery({
    scope: "library",
    key: () => ["playlists"],
    query: () => fetchLibraryPlaylists(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
