import { fetchLibraryFolders } from "#layers/libdata/app/lib/queries/folders";

export default function useLibraryFolders() {
  return useLibraryQuery({
    key: () => ["playlist-folders"],
    query: () => fetchLibraryFolders(),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
