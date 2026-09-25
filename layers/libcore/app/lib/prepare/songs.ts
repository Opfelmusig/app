import type { DbSong } from "#layers/libcore/app/database/types";
import {
  addLibraryCatalogLink,
  addListResource,
  addResource,
} from "#layers/libcore/app/lib/prepare/helpers";
import type { SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addSongs(target: AppleMusicLibrary, resources: SongsScopes[], listId: string) {
  resources.forEach((resource, index) => addSong(target, resource, listId, index));
}

export function addSong(
  target: AppleMusicLibrary,
  resource: SongsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseSong(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.songs.has(parsed.id)) return;

  target.songs.set(parsed.id, parsed);
  addResource(target, parsed.id, "library-songs");

  const catalog = resource.relationships?.catalog.data[0];

  if (!catalog) return;

  const albums = catalog.relationships?.albums.data;

  albums?.forEach(
    (album, index) =>
      album.attributes &&
      addLibraryCatalogLink(target, parsed.id, "album", album.id, album.attributes.name, index),
  );

  const artists = catalog.relationships?.artists.data;

  artists?.forEach(
    (artist, index) =>
      artist.attributes &&
      addLibraryCatalogLink(target, parsed.id, "artist", artist.id, artist.attributes.name, index),
  );
}

function parseSong(resource: SongsScopes): DbSong {
  const catalog = resource.relationships?.catalog.data[0];
  const album = resource.relationships?.albums.data[0];
  const artist = resource.relationships?.artists.data[0];
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${resource.id}: missing attributes`);

  return {
    id: resource.id,

    name: attributes.name,
    albumName: attributes.albumName,
    artistName: attributes.artistName,
    genreNames: attributes.genreNames,
    artwork: attributes.artwork ?? catalog?.attributes?.artwork,
    durationInMillis: attributes.durationInMillis,
    discNumber: attributes.discNumber ?? catalog?.attributes?.discNumber,
    trackNumber: attributes.trackNumber,
    releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,

    catalogId: catalog?.id,
    personalRating: catalog?.attributes?.personalRating,

    albumId: album?.id,
    artistId: artist?.id,
  };
}
