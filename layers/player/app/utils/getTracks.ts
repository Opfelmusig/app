import { parseCatalogSong } from "#layers/amdata/app/lib/parsers/songs";
import { fetchCatalogAlbumTracks } from "#layers/amdata/app/lib/queries/albums";
import {
  fetchCatalogPlaylistTracks,
  fetchLibraryPlaylistTracks,
} from "#layers/amdata/app/lib/queries/playlists";
import { catalogSongsScopes } from "#layers/amdata/app/lib/scopes/catalog";

export default async function getTracks(
  resource: AmAlbum | AmPlaylist | AmCatalogStation,
  limit?: number,
): Promise<AmListResource<AmSong>[]> {
  const client = useClient();

  switch (resource.type) {
    case "albums":
      return fetchCatalogAlbumTracks(resource.id);
    case "playlists":
      return fetchCatalogPlaylistTracks(resource.id);

    case "library-albums": {
      const library = useLibrary();
      const { sortBy, direction } = getSavedSorting(resource.id, "discAndTrackNumber");

      const tracks = await library.client.getAlbumTracks(resource.id);
      return sortSongs(tracks, sortBy, direction);
    }

    case "library-playlists": {
      const { sortBy, direction } = getSavedSorting(resource.id, "default");

      const tracks = await fetchLibraryPlaylistTracks(resource.id);
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
