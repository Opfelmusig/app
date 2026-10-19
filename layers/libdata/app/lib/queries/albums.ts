import { collect } from "@opfelmusig/lib/helpers";

import { parseLibraryAlbum } from "#layers/amdata/app/lib/parsers/albums";
import { parseLibrarySong } from "#layers/amdata/app/lib/parsers/songs";
import { libraryAlbumsScopes, librarySongsScopes } from "#layers/libdata/app/lib/scopes/library";

export async function fetchLibraryAlbums() {
  const client = useClient();

  const albums = await collect(
    client.library.albums.iterateAll({
      limit: 100,
      scopes: libraryAlbumsScopes,
      sort: "-dateAdded",
    }),
  );

  return albums.filter(hasResourceName).map(parseLibraryAlbum);
}

export async function fetchLibraryAlbum(id: string) {
  const client = useClient();

  const response = await client.library.albums.get(id, {
    scopes: libraryAlbumsScopes,
  });

  const album = response.data[0];
  if (!hasResourceName(album)) return null;

  return parseLibraryAlbum(album);
}

export async function fetchLibraryAlbumTracks(id: string) {
  const client = useClient();

  const tracks = await collect(
    client.library.albums.iterateRelationship(id, "tracks", {
      limit: 100,
      scopes: librarySongsScopes,
    }),
  );

  const songs = tracks
    .filter((track) => track.type === "library-songs")
    .filter(hasResourceName)
    .map(parseLibrarySong);

  return createListResources(songs, id);
}
