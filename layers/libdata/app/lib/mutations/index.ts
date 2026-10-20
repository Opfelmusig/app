import { collect } from "@opfelmusig/lib/helpers";
import type {
  MutateLibraryPlaylist,
  MutateLibraryPlaylistFolder,
  RateableResourceTypes,
  RatingValue,
} from "@opfelmusig/lib/types";
import type { EntryKey } from "@pinia/colada";

import { invalidate } from "#layers/libdata/app/lib/mutations/invalidate";

const log = logger.withTag("mutations");

export class LibraryMutations {
  private client = useClient();
  private queryCache = useQueryCache();
  private toast = useToast();
  private queue = useQueueStore();
  private history = useHistoryStore();

  private async invalidate(...keys: EntryKey[]) {
    if (!keys.length) return;

    try {
      const results = await Promise.allSettled(
        keys.map((key) =>
          this.queryCache.invalidateQueries({
            key,
          }),
        ),
      );

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (errors.length) {
        throw new AggregateError(errors, "Could not invalidate queries");
      }
    } catch (cause) {
      log.error("Could not invalidate queries", { keys, cause });
      this.toast.add({
        title: "Library refresh failed",
        description:
          "The change was saved, but your library could not be refreshed. Please try refreshing again.",
        color: "warning",
      });
    }
  }

  private async mutate<T>(name: string, mutation: () => Promise<T>): Promise<T> {
    try {
      return await mutation();
    } catch (cause) {
      log.error("Could not execute mutation", { name, cause });
      this.toast.add({
        title: "Action failed",
        description: `Could not execute action '${name}'.`,
        color: "error",
      });
      throw cause;
    }
  }

  async setPinned(id: string, pinned: boolean) {
    if (pinned) await this.mutate("pin", () => this.client.library.pin(id));
    else await this.mutate("unpin", () => this.client.library.unpin(id));

    await this.invalidate(["libdata", "pins"]);
  }

  async createPlaylist(attributes: MutateLibraryPlaylist["attributes"], parentId: string) {
    await this.mutate("playlist:create", () =>
      this.client.library.playlists.create(attributes, { parentId }),
    );
    await this.invalidate(["libdata", "playlists", "list"]);
  }

  async editPlaylist(playlist: AmLibraryPlaylist, attributes: MutateLibraryPlaylist["attributes"]) {
    await this.mutate("playlist:edit", () =>
      this.client.library.playlists.edit(playlist.id, attributes),
    );
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", playlist.id],
      ["libdata", "pins"],
    );
  }

  async deletePlaylist(playlist: AmLibraryPlaylist) {
    await this.mutate("playlist:delete", () => this.client.library.playlists.delete(playlist.id));
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", playlist.id],
      ["libdata", "playlists", "tracks", playlist.id],
      ["libdata", "pins"],
    );
  }

  async removePlaylistTrack(id: string, songId: string) {
    await this.mutate("playlist-track:remove", () =>
      this.client.library.playlists.removeTracks(id, [songId]),
    );
    await this.invalidate(
      ["libdata", "playlists", "tracks", id],
      ["libdata", "playlists", "resource", id],
      ["libdata", "playlists", "list"],
      ["libdata", "pins"],
    );
  }

  async movePlaylist(id: string, parentId: string) {
    await this.mutate("playlist:move", () => this.client.library.playlists.setParent(id, parentId));
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", id],
      ["libdata", "pins"],
    );
  }

  async reorderPlaylistTracks(
    id: string,
    original: readonly AmLibrarySong[],
    tracks: readonly AmLibrarySong[],
  ) {
    await this.mutate("playlist-tracks:reorder", async () => {
      const current = await collect(
        this.client.library.playlists.iterateRelationship(id, "tracks", { limit: 100 }),
      );
      if (
        current.length !== original.length ||
        current.some(
          (track, index) =>
            track.id !== original[index]?.id || track.type !== original[index]?.type,
        )
      ) {
        await this.invalidate(["libdata", "playlists", "tracks", id]);
        throw new Error("The playlist changed. Cancel editing and try again.");
      }

      await this.client.library.playlists.setTracks(
        id,
        tracks.map(({ id, type }) => ({ id, type })),
      );
    });
    await this.invalidate(
      ["libdata", "playlists", "tracks", id],
      ["libdata", "playlists", "resource", id],
    );
  }

  async createPlaylistFolder(
    attributes: MutateLibraryPlaylistFolder["attributes"],
    parentId: string,
  ) {
    await this.mutate("playlist-folder:create", () =>
      this.client.library.playlistFolders.create(attributes, { parentId }),
    );
    await this.invalidate(["libdata", "playlist-folders", "list"]);
  }

  async editPlaylistFolder(id: string, attributes: MutateLibraryPlaylistFolder["attributes"]) {
    await this.mutate("playlist-folder:edit", () =>
      this.client.library.playlistFolders.edit(id, attributes),
    );
    await this.invalidate(["libdata", "playlist-folders"]);
  }

  async deletePlaylistFolder(id: string) {
    await this.mutate("playlist-folder:delete", () =>
      this.client.library.playlistFolders.delete(id),
    );
    await this.invalidate(
      ["libdata", "playlist-folders"],
      ["libdata", "playlists"],
      ["libdata", "pins"],
    );
  }

  async movePlaylistFolder(id: string, parentId: string) {
    await this.mutate("playlist-folder:move", () =>
      this.client.library.playlistFolders.setParent(id, parentId),
    );
    await this.invalidate(["libdata", "playlist-folders"]);
  }

  async addToLibrary(id: string, type: "songs" | "albums") {
    await this.mutate("library:add", () => this.client.library.add({ [type]: [id] }));
    await this.invalidate(...invalidate.library(type, id));
  }

  async removeFromLibrary(id: string, type: "songs" | "albums", catalogId?: string) {
    await this.mutate("library:remove", () => this.client.library.remove(id, type));
    await this.invalidate(...invalidate.library(type, catalogId));
  }

  private async invalidateResourceType(
    id: string,
    type: RateableResourceTypes,
    counterpartId?: string,
  ) {
    const isLibrary = type.startsWith("library-");
    const libraryId = isLibrary ? id : counterpartId;
    const catalogId = isLibrary ? counterpartId : id;

    if (type === "songs" || type === "library-songs") {
      await this.invalidate(...invalidate.songs(libraryId, catalogId));
    } else if (type === "albums" || type === "library-albums") {
      await this.invalidate(...invalidate.albums(libraryId, catalogId));
    } else if (type === "artists" || type === "library-artists") {
      await this.invalidate(...invalidate.artists(libraryId, catalogId));
    } else if (type === "playlists" || type === "library-playlists") {
      await this.invalidate(...invalidate.playlists(libraryId, catalogId));
    }
  }

  async setRating(
    id: string,
    type: RateableResourceTypes,
    rating: RatingValue,
    counterpartId?: string,
  ) {
    await this.mutate("rating:add", () => this.client.me.ratings.set(id, type, rating));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, rating);
      this.history.updateRating(id, rating);
    }
    await this.invalidateResourceType(id, type, counterpartId);
  }

  async deleteRating(id: string, type: RateableResourceTypes, counterpartId?: string) {
    await this.mutate("rating:remove", () => this.client.me.ratings.delete(id, type));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, null);
      this.history.updateRating(id, null);
    }
    await this.invalidateResourceType(id, type, counterpartId);
  }
}
