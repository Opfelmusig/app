import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { catalogSongsScopes } from "#layers/amdata/app/lib/scopes/songs";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";

export default async function getTracks(
  resource: AmLibraryAlbum | AmLibraryPlaylist | AmCatalogStation,
  limit?: number,
): Promise<AmListResource<AmSong>[]> {
  const library = useLibrary();
  const client = useClient();

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

    case "stations": {
      const songs = await client.me.stations.getNextTracks(resource.id, {
        limit: limit ?? 1,
        scopes: catalogSongsScopes,
      });

      const parsed = songs.data
        .filter((resource) => resource.type === "songs")
        .filter(hasResourceName)
        .map(parseCatalogSong);

      if (parsed.length < (limit ?? 1)) {
        throw new Error("The station did not return enough songs");
      }

      return parsed.map((song, i) => createListResource(song, `stations:${resource.id}`, i));
    }
  }
}
