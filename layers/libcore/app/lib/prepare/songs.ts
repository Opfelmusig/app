import type { DbSong } from "#layers/libcore/app/database/types";
import {
  addLibraryCatalogLink,
  addListResource,
  addResource,
} from "#layers/libcore/app/lib/prepare/helpers";
import type { SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addSong(
  target: AppleMusicLibrary,
  song: SongsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseSong(song);
  const existing = target.songs.find((song) => song.id === parsed.id);

  addListResource(target, parsed.id, listId, position);

  if (existing) return;

  target.songs.push(parsed);
  addResource(target, parsed.id, "song");

  const catalog = song.relationships?.catalog.data[0];

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

function parseSong(song: SongsScopes): DbSong {
  const catalog = song.relationships?.catalog.data[0];
  const album = song.relationships?.albums.data[0];
  const artist = song.relationships?.artists.data[0];
  const attributes = song.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${song.id}: missing attributes`);

  return {
    id: song.id,
    name: attributes.name,
    trackNumber: attributes.trackNumber,
    albumName: attributes.albumName,
    artistName: attributes.artistName,
    durationInMillis: attributes.durationInMillis,
    genreNames: attributes.genreNames,
    artwork: attributes.artwork ?? catalog?.attributes?.artwork,
    releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,
    personalRating: catalog?.attributes?.personalRating,
    albumId: album?.id,
    artistId: artist?.id,
    catalogId: catalog?.id,
  };
}
