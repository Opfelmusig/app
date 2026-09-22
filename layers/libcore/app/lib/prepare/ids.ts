import type { DbCatalogLinkType } from "#layers/libcore/app/database/types";

export const listResourceId = (listId: string, position: number) => `${listId}:${position}`;
export const libraryCatalogLinkId = (
  resourceId: string,
  type: DbCatalogLinkType,
  position: number,
) => `${resourceId}:${type}:${position}`;

export const albumTracksListId = (resourceId: string) => `album:${resourceId}:tracks`;
export const playlistTracksListId = (resourceId: string) => `playlist:${resourceId}:tracks`;
export const artistAlbumListId = (resourceId: string) => `artist:${resourceId}:albums`;
export const folderChildrenListId = (resourceId: string) => `folder:${resourceId}:children`;
