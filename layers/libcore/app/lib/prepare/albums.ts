import type { DbAlbum } from "#layers/libcore/app/database/types";
import {
  addLibraryCatalogLink,
  addListResource,
  addResource,
} from "#layers/libcore/app/lib/prepare/helpers";
import { albumTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import type { AlbumsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addAlbums(target: AppleMusicLibrary, album: AlbumsScopes[], listId: string) {
  album.forEach((album, index) => addAlbum(target, album, listId, index));
}

export function addAlbum(
  target: AppleMusicLibrary,
  album: AlbumsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseAlbum(album);

  addListResource(target, parsed.id, listId, position);

  if (target.albums.has(parsed.id)) return;

  target.albums.set(parsed.id, parsed);
  addResource(target, parsed.id, "album");

  const catalog = album.relationships?.catalog.data[0];

  if (!catalog) return;

  const artists = catalog.relationships?.artists.data;

  artists?.forEach(
    (artist, index) =>
      artist.attributes &&
      addLibraryCatalogLink(target, parsed.id, "artist", artist.id, artist.attributes.name, index),
  );
}

function parseAlbum(album: AlbumsScopes): DbAlbum {
  const catalog = album.relationships?.catalog.data[0];
  const artist = album.relationships?.artists.data[0];
  const attributes = album.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music album: ${album.id}: missing attributes`);

  return {
    id: album.id,

    name: attributes.name,
    artistName: attributes.artistName,
    genreNames: attributes.genreNames,
    artwork: attributes.artwork ?? catalog?.attributes?.artwork,
    releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,
    dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,

    editorialVideo: catalog?.attributes?.editorialVideo,
    catalogId: catalog?.id,
    personalRating: catalog?.attributes?.personalRating,

    tracksListId: albumTracksListId(album.id),
    artistId: artist?.id,
  };
}
