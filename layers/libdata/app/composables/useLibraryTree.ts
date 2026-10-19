import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import { groupBy, sort } from "remeda";

export default function useLibraryTree(id: MaybeRefOrGetter<string> = ROOT_FOLDER_ID) {
  const { playlists, folders, error, isPending } = useLibraryPlaylistAndFolders();

  const data = computed<AmLibraryTreeNode[] | undefined>(() => {
    if (!folders.data.value || !playlists.data.value) return;

    const foldersByParent = groupBy(
      folders.data.value.filter((folder) => folder.id !== ROOT_FOLDER_ID),
      (item) => item.extras.parentId,
    );
    const playlistsByParent = groupBy(playlists.data.value, (item) => item.extras.parentId);

    function build(parentId: string): AmLibraryTreeNode[] {
      return [
        ...sort(foldersByParent[parentId] ?? [], byName).map((item) => ({
          type: item.type,
          item,
          children: build(item.id),
        })),
        ...sort(playlistsByParent[parentId] ?? [], byName).map((item) => ({
          type: item.type,
          item,
        })),
      ];
    }

    return build(toValue(id));
  });

  return {
    data,
    error,
    isPending,
  };
}
