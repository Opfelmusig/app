import type { ResourceTypes } from "@opfelmusig/lib/types";

import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type {
  AmLibraryPlaylist,
  AmLibraryPlaylistFolder,
} from "#layers/amdata/app/types/playlists";
import type { AmLibrarySong } from "#layers/amdata/app/types/songs";

export interface AmResource {
  id: string;
  type: ResourceTypes;
}

export interface AmCatalogLink {
  id: string;
  name: string;
}

export type AmResources =
  | AmLibrarySong
  | AmLibraryAlbum
  | AmLibraryArtist
  | AmLibraryPlaylist
  | AmLibraryPlaylistFolder;
