import type { ResourceTypes } from "@opfelmusig/lib/types";

export interface AmResourceBase {
  id: string;
  type: ResourceTypes;
}

export interface AmCatalogLink {
  id: string;
  name: string;
}

export type AmResource =
  | AmSong
  | AmAlbum
  | AmArtist
  | AmPlaylist
  | AmCatalogStation
  | AmLibraryPlaylistFolder
  | AmSocialProfile;

export type AmListResource<TResource extends AmResource> = TResource extends AmResource
  ? {
      key: string;
      type: "list-resources";
      position: number;
      resourceType: TResource["type"];
      resource: TResource;
    }
  : never;
