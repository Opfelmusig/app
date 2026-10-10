import type { DbPlaylistTracksListId } from "#layers/libcore/app/database/types";

export const listResourceId = (listId: string, position: number) => `${listId}:${position}`;

export const playlistTracksListId = (resourceId: string): DbPlaylistTracksListId =>
  `library-playlists:${resourceId}`;
