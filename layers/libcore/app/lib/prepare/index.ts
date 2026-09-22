import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages, LibraryResourcePages } from "#layers/libcore/app/lib/fetch";
import { addList } from "#layers/libcore/app/lib/prepare/helpers";
import { addSong } from "#layers/libcore/app/lib/prepare/songs";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(
  target: AppleMusicLibrary,
  pages: LibraryPages,
  _resourcePages: LibraryResourcePages,
) {
  addList(target, DbListId.Songs);
  pages.songs.forEach((song, index) => addSong(target, song, DbListId.Songs, index));
}
