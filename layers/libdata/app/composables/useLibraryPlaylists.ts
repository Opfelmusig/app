import { fetchLibraryPlaylists } from "#layers/libdata/app/lib/queries/playlists";

export default function useLibraryPlaylists() {
  return useLibraryQuery({
    key: () => ["playlists"],
    query: () => fetchLibraryPlaylists(),
    staleTime: ms("6h"),
  });
}
