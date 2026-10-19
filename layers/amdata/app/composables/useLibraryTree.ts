import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";
import { groupBy, sort } from "remeda";

export default function useLibraryTree(id: MaybeRefOrGetter<string> = ROOT_FOLDER_ID) {
  const { playlists, folders } = useLibraryPlaylists();

  const data = computed<AmLibraryTreeNode[] | undefined>(() => {
    if (!folders.data.value || !playlists.data.value) return;

    const byName = (
      left: AmLibraryPlaylist | AmLibraryPlaylistFolder,
      right: AmLibraryPlaylist | AmLibraryPlaylistFolder,
    ) => left.attributes.name.localeCompare(right.attributes.name);

    const foldersByParent = groupBy(folders.data.value, (item) => item.extras.parentId);
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
    isPending: computed(() => playlists.isPending.value ?? folders.isPending.value),
    error: computed(() => playlists.error.value ?? folders.error.value),
  };
}
