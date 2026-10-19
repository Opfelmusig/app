import type { ResourceTypes } from "@opfelmusig/lib/types";

export interface AmResourceBase {
  id: string;
  type: ResourceTypes;
  shared?: {
    reasonForDisplay?: string;
  };
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
