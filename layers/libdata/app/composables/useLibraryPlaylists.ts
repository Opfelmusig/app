import { fetchLibraryPlaylists } from "#layers/libdata/app/lib/queries/playlists";

export default function useLibraryPlaylists() {
  return useLibraryQuery({
    key: () => ["playlists"],
    query: () => fetchLibraryPlaylists(),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
