import { fetchLibraryFolders } from "#layers/libdata/app/lib/queries/folders";

export default function useLibraryFolders() {
  return useLibraryQuery({
    key: () => ["playlist-folders"],
    query: ({ signal }) => fetchLibraryFolders(signal),
    staleTime: ms("3h"),
    gcTime: false,
  });
}
