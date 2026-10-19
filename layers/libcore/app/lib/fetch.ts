import type { OpfelMusigClient } from "@opfelmusig/lib";
import { collect } from "@opfelmusig/lib/helpers";

import { librarySongsScopes, type LibrarySongsScopes } from "#layers/amdata/app/lib/scopes/library";
import { prepareAppleMusicLibrary } from "#layers/libcore/app/lib/prepare";
import { createEmptyLibrary } from "#layers/libcore/app/lib/prepare/helpers";
import type { AppleMusicLibrary } from "#layers/libcore/app/lib/types";
import type { LibraryProgress } from "#layers/libcore/app/plugins/libcore";

export async function fetchAppleMusicLibrary(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<AppleMusicLibrary> {
  const target = createEmptyLibrary();

  const pages = await fetchAllLibraryPages(client, signal, progress);
  prepareAppleMusicLibrary(target, pages);

  return target;
}

export interface LibraryPages {
  songs: LibrarySongsScopes[];
}

function fetchAllLibraryPages(
  client: OpfelMusigClient,
  signal: AbortSignal,
  progress: LibraryProgress,
): Promise<LibraryPages> {
  return Promise.allKeyed({
    songs: collect(
      client.library.songs.iterateAll({
        limit: 100,
        scopes: librarySongsScopes,
        sort: "-dateAdded",
        config: { signal },
      }),
      {
        signal,
        onItem: () => {
          progress.songs.count++;
        },
      },
    ).then((resources) => {
      progress.songs.done = true;
      return resources.filter(hasResourceName);
    }),
  });
}
