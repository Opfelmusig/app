import type { AmLibrarySong } from "#layers/amdata/app/types/songs";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
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

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

function parseSong(resource: SongsScopes): AmLibrarySong {
  const catalog = resource.relationships?.catalog.data[0];
  const album = resource.relationships?.albums.data[0];
  const artist = resource.relationships?.artists.data[0];
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music song: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-songs",

    attributes: {
      name: attributes.name,
      albumName: attributes.albumName,
      artistName: attributes.artistName,
      genreNames: attributes.genreNames,
      artwork: attributes.artwork ?? catalog?.attributes?.artwork,
      durationInMillis: attributes.durationInMillis,
      discNumber: attributes.discNumber ?? catalog?.attributes?.discNumber,
      trackNumber: attributes.trackNumber,
      releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,
      contentRating: attributes.contentRating ?? catalog?.attributes?.contentRating,
      personalRating: catalog?.attributes?.personalRating,

      albumId: album?.id,
      artistId: artist?.id,

      albums:
        catalog?.relationships?.albums.data.map((album) => ({
          id: album.id,
          name: album.attributes?.name ?? "Unknown",
        })) ?? [],
      artists:
        catalog?.relationships?.artists.data.map((artist) => ({
          id: artist.id,
          name: artist.attributes?.name ?? "Unknown",
        })) ?? [],
    },

    catalogId: catalog?.id,
  };
}
