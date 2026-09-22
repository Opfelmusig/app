import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages, LibraryResourcePages } from "#layers/libcore/app/lib/fetch";
import { addAlbums, addAlbumTracks } from "#layers/libcore/app/lib/prepare/albums";
import { addList } from "#layers/libcore/app/lib/prepare/helpers";
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
  addAlbumTracks(target, resourcePages.albums);

  addList(target, DbListId.Artists);

  addList(target, DbListId.Playlists);

  addList(target, DbListId.Pins);
}
