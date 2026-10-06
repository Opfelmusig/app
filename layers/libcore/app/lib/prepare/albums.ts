import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { AlbumsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addAlbums(target: AppleMusicLibrary, resources: AlbumsScopes[], listId: string) {
  resources.forEach((resource, index) => addAlbum(target, resource, listId, index));
}

export function addAlbum(
  target: AppleMusicLibrary,
  resource: AlbumsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseAlbum(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

function parseAlbum(resource: AlbumsScopes): AmLibraryAlbum {
  const catalog = resource.relationships?.catalog.data[0];
  const artist = resource.relationships?.artists.data[0];
  const attributes = resource.attributes;

  if (!attributes) throw new Error(`Invalid Apple Music album: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-albums",

    attributes: {
      name: attributes.name,
      artistName: attributes.artistName,
      genreNames: attributes.genreNames,
      artwork: attributes.artwork ?? catalog?.attributes?.artwork,
      releaseDate: attributes.releaseDate ?? catalog?.attributes?.releaseDate,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
      contentRating: attributes.contentRating ?? catalog?.attributes?.contentRating,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,
      artistId: artist?.id,

      artists:
        catalog?.relationships?.artists.data.map((artist) => ({
          id: artist.id,
          name: artist.attributes?.name ?? "Unknown",
        })) ?? [],
    },

    catalogId: catalog?.id,
  };
}
