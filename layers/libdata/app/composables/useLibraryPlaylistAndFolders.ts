export default function useLibraryPlaylistAndFolders() {
  const playlists = useLibraryPlaylists();
  const folders = useLibraryFolders();

  return {
    playlists,
    folders,
    isPending: computed(() => playlists.isPending.value || folders.isPending.value),
    error: computed(() => playlists.error.value ?? folders.error.value),
  };
}
