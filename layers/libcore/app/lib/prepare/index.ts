import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages } from "#layers/libcore/app/lib/fetch";
import { addSong } from "#layers/libcore/app/lib/prepare/songs";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(target: AppleMusicLibrary, pages: LibraryPages) {
  target.lists.push({
    id: DbListId.Songs,
  });

  pages.songs.forEach((song, index) => addSong(target, song, DbListId.Songs, index));
}
