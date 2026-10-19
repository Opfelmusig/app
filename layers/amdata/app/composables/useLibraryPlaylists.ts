import {
  fetchLibraryFolders,
  fetchLibraryPlaylists,
} from "#layers/amdata/app/lib/queries/playlists";

export default function useLibraryPlaylists() {
  const playlists = useAmQuery({
    scope: "library",
    key: () => ["playlists"],
    query: () => fetchLibraryPlaylists(),
    staleTime: ms("6h"),
    gcTime: false,
  });

  const folders = useAmQuery({
    scope: "library",
    key: () => ["playlist-folders"],
    query: () => fetchLibraryFolders(),
    staleTime: ms("6h"),
    gcTime: false,
  });

  return {
    playlists,
    folders,
  };
}
