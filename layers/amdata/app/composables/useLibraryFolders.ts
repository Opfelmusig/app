import { fetchLibraryFolders } from "#layers/amdata/app/lib/queries/playlists";

export default function useLibraryFolders() {
  return useAmQuery({
    scope: "library",
    key: () => ["playlist-folders"],
    query: () => fetchLibraryFolders(),
    staleTime: ms("6h"),
    gcTime: false,
  });
}
