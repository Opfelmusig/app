import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlist";
import { addListResource } from "#layers/libcore/app/lib/prepare/helpers";
import { playlistTracksListId } from "#layers/libcore/app/lib/prepare/ids";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import type { PlaylistsScopes, SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function addPlaylists(
  target: AppleMusicLibrary,
  resources: PlaylistsScopes[],
  listId: string,
) {
  resources.forEach((resource, index) => addPlaylist(target, resource, listId, index));
}

export function addPlaylist(
  target: AppleMusicLibrary,
  resource: PlaylistsScopes,
  listId: string,
  position: number,
) {
  const parsed = parsePlaylist(resource);

  addListResource(target, parsed.id, listId, position);

  if (target.resources.has(parsed.id)) return;

  target.resources.set(parsed.id, parsed);
}

export function parsePlaylist(resource: PlaylistsScopes): AmLibraryPlaylist {
  const catalog = resource.relationships?.catalog.data[0];
  const attributes = resource.attributes;

  if (!attributes)
    throw new Error(`Invalid Apple Music playlist: ${resource.id}: missing attributes`);

  const lastModifiedDate = catalog?.attributes?.lastModifiedDate ?? attributes.lastModifiedDate;
  const parentId = resource.relationships?.parent.data[0]?.id ?? ROOT_FOLDER_ID;

  return {
    id: resource.id,
    type: "library-playlists",

    attributes: {
      name: attributes.name,
      artwork: attributes.artwork ?? catalog?.attributes?.artwork,
      description: attributes.description?.standard ?? catalog?.attributes?.description?.standard,
      lastModifiedDate: lastModifiedDate ? new Date(lastModifiedDate) : undefined,
      canEdit: attributes.canEdit,
      isPublic: attributes.isPublic,
      dateAdded: attributes.dateAdded ? new Date(attributes.dateAdded) : undefined,
      tags: attributes.tags ?? [],
      curatorName: catalog?.attributes?.curatorName,
      curatorSocialHandle: catalog?.attributes?.curatorSocialHandle,
      editorialVideo: catalog?.attributes?.editorialVideo,
      personalRating: catalog?.attributes?.personalRating,
    },

    catalogId: catalog?.id,
    parentId,
  };
}

export function addPlaylistTracks(
  target: AppleMusicLibrary,
  resources: Record<string, SongsScopes[]>,
) {
  const entries = Object.entries(resources);

  entries.forEach(([id, tracks]) => {
    const listId = playlistTracksListId(id);

    addSongs(target, tracks, listId);
  });
}
