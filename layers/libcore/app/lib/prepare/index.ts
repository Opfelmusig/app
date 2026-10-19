import { DbListId } from "#layers/libcore/app/database/types";
import type { LibraryPages } from "#layers/libcore/app/lib/fetch";
import { addResources } from "#layers/libcore/app/lib/prepare/resources";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";

export function prepareAppleMusicLibrary(target: AppleMusicLibrary, pages: LibraryPages) {
  addResources(target, pages.songs, DbListId.Songs);

  addResources(target, pages.artists, DbListId.Artists);
}
