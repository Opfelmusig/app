import type { LibrarySongsScopes } from "#layers/amdata/app/lib/scopes/library";
import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages } from "#layers/libcore/app/lib/fetch";
import { addFolders } from "#layers/libcore/app/lib/prepare/folders";
import { addPins } from "#layers/libcore/app/lib/prepare/pins";
import { addPlaylistTracks } from "#layers/libcore/app/lib/prepare/playlists";
import { addResources } from "#layers/libcore/app/lib/prepare/resources";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(
  target: AppleMusicLibrary,
  pages: LibraryPages,
  playlistTracks: Record<string, LibrarySongsScopes[]>,
) {
  addResources(target, pages.songs, DbListId.Songs);

  addResources(target, pages.albums, DbListId.Albums);

  addResources(target, pages.artists, DbListId.Artists);

  addResources(target, pages.playlists, DbListId.Playlists);
  addPlaylistTracks(target, playlistTracks);

  addPins(target, pages.pins, DbListId.Pins);

  addFolders(target, pages.playlistFolders, DbListId.PlaylistFolders);
}
