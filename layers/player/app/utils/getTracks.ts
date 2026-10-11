import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

export default async function getTracks(resource: AmLibraryAlbum | AmLibraryPlaylist) {
  const library = useLibrary();

  switch (resource.type) {
    case "library-albums": {
      const { sortBy, direction } = getSavedSorting(`album:${resource.id}`, "discAndTrackNumber");

      const tracks = await library.client.getAlbumTracks(resource.id);
      return sortSongs(tracks, sortBy, direction);
    }

    case "library-playlists": {
      const listId = playlistTracksListId(resource.id);
      const { sortBy, direction } = getSavedSorting(listId, "default");

      await library.refreshPlaylist(resource.id);
      const tracks = await library.client.getListResources(listId);
      return sortSongs(tracks, sortBy, direction);
    }
  }
}
