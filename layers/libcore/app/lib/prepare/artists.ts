import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import type { ArtistsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addArtists(target: AppleMusicLibrary, resources: ArtistsScopes[], listId: string) {
  resources.forEach((resource, index) => addArtist(target, resource, listId, index));
}

export function addArtist(
  target: AppleMusicLibrary,
  resource: ArtistsScopes,
  listId: string,
  position: number,
) {
  const parsed = parseArtist(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

function parseArtist(resource: ArtistsScopes): AmLibraryArtist {
  const catalog = resource.relationships?.catalog.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music artist: ${resource.id}: missing attributes`);

  return {
    id: resource.id,
    type: "library-artists",

    attributes: {
      name: attributes.name,
      genreNames: catalog?.attributes?.genreNames ?? [],
      artwork: catalog?.attributes?.artwork,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,
    },

    catalogId: catalog?.id,
  };
}
