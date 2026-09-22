import type { DbCatalogLinkType } from "#layers/libcore/app/database/types";

export const listResourceId = (listId: string, position: number) => `${listId}:${position}`;
export const libraryCatalogLinkId = (
  resourceId: string,
  type: DbCatalogLinkType,
  position: number,
) => `${resourceId}:${type}:${position}`;

export const playlistTracksListId = (resourceId: string) => `playlist:${resourceId}:tracks`;
