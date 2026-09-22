import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages, LibraryResourcePages } from "#layers/libcore/app/lib/fetch";
import { addAlbums, addAlbumTracks } from "#layers/libcore/app/lib/prepare/albums";
import { addArtistAlbums, addArtists } from "#layers/libcore/app/lib/prepare/artists";
import { addFolders } from "#layers/libcore/app/lib/prepare/folders";
import { addList } from "#layers/libcore/app/lib/prepare/helpers";
import { addPins } from "#layers/libcore/app/lib/prepare/pins";
import { addPlaylists, addPlaylistTracks } from "#layers/libcore/app/lib/prepare/playlists";
import { addSongs } from "#layers/libcore/app/lib/prepare/songs";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(
  target: AppleMusicLibrary,
  pages: LibraryPages,
  resourcePages: LibraryResourcePages,
) {
  addList(target, DbListId.Songs);
  addSongs(target, pages.songs, DbListId.Songs);

  addList(target, DbListId.Albums);
  addAlbums(target, pages.albums, DbListId.Albums);
  addAlbumTracks(target, resourcePages.albumTracks);

  addList(target, DbListId.Artists);
  addArtists(target, pages.artists, DbListId.Artists);
  addArtistAlbums(target, resourcePages.artistAlbums);

  addList(target, DbListId.Playlists);
  addPlaylists(target, pages.playlists, DbListId.Playlists);
  addPlaylistTracks(target, resourcePages.playlistTracks);

  addList(target, DbListId.Pins);
  addPins(target, pages.pins, DbListId.Pins);

  addList(target, DbListId.PlaylistFolders);
  addFolders(target, pages.playlistFolders, DbListId.PlaylistFolders);
}
