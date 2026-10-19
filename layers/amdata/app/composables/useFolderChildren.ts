export default function useFolderChildren(id: MaybeRefOrGetter<string>) {
  const { playlists, folders, error, isPending } = useLibraryPlaylistAndFolders();

  return {
    data: computed(() => {
      const folderId = toValue(id);

      return [...(folders.data.value ?? []), ...(playlists.data.value ?? [])]
        .filter((item) => item.id !== folderId && item.extras.parentId === folderId)
        .toSorted(byName);
    }),
    error,
    isPending,
  };
}
