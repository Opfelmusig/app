import type { ResourceTypes } from "@opfelmusig/lib/types";

import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmSong } from "#layers/amdata/app/types/songs";

export interface AmResourceBase {
  id: string;
  type: ResourceTypes;
}

export interface AmCatalogLink {
  id: string;
  name: string;
}

export type AmResource = AmSong | AmAlbum | AmArtist | AmPlaylist | AmLibraryPlaylistFolder;
