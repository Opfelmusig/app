import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages } from "#layers/libcore/app/lib/fetch";
import { addAlbums } from "#layers/libcore/app/lib/prepare/albums";
import { addArtists } from "#layers/libcore/app/lib/prepare/artists";
import { addFolders } from "#layers/libcore/app/lib/prepare/folders";
import { addList } from "#layers/libcore/app/lib/prepare/helpers";
import { addPins } from "#layers/libcore/app/lib/prepare/pins";
import { addPlaylists, addPlaylistTracks } from "#layers/libcore/app/lib/prepare/playlists";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import type { SongsScopes } from "#layers/libcore/app/lib/scopes";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(
  target: AppleMusicLibrary,
  pages: LibraryPages,
  playlistTracks: Record<string, SongsScopes[]>,
) {
  addList(target, DbListId.Songs);
  addSongs(target, pages.songs, DbListId.Songs);

  addList(target, DbListId.Albums);
  addAlbums(target, pages.albums, DbListId.Albums);

  addList(target, DbListId.Artists);
  addArtists(target, pages.artists, DbListId.Artists);

  addList(target, DbListId.Playlists);
  addPlaylists(target, pages.playlists, DbListId.Playlists);
  addPlaylistTracks(target, playlistTracks);

  addList(target, DbListId.Pins);
  addPins(target, pages.pins, DbListId.Pins);

  addList(target, DbListId.PlaylistFolders);
  addFolders(target, pages.playlistFolders, DbListId.PlaylistFolders);
}
