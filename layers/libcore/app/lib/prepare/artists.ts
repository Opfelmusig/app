import type { DbArtist } from "#layers/libcore/app/database/types";
import { addAlbums } from "#layers/libcore/app/lib/prepare/albums";
import { addList, addListResource, addResource } from "#layers/libcore/app/lib/prepare/helpers";
import { artistAlbumListId } from "#layers/libcore/app/lib/prepare/ids";
import type { AlbumsScopes, ArtistsScopes } from "#layers/libcore/app/lib/scopes";
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

  if (target.artists.has(parsed.id)) return;

  target.artists.set(parsed.id, parsed);
  addResource(target, parsed.id, "artist");
}

function parseArtist(resource: ArtistsScopes): DbArtist {
  const catalog = resource.relationships?.catalog.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music artist: ${resource.id}: missing attributes`);

  return {
    id: resource.id,

    name: attributes.name,
    genreNames: catalog?.attributes?.genreNames ?? [],
    artwork: catalog?.attributes?.artwork,

    editorialVideo: catalog?.attributes?.editorialVideo,
    catalogId: catalog?.id,
    personalRating: catalog?.attributes?.personalRating,

    albumsListId: artistAlbumListId(resource.id),
  };
}

export function addArtistAlbums(
  target: AppleMusicLibrary,
  resources: Record<string, AlbumsScopes[]>,
) {
  const entries = Object.entries(resources);

  entries.forEach(([id, albums]) => {
    const listId = artistAlbumListId(id);

    addList(target, listId);
    addAlbums(target, albums, listId);
  });
}
