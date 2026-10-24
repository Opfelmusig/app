import type {
  MutateLibraryPlaylist,
  MutateLibraryPlaylistFolder,
  MutateRelationshipItems,
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

    const startedAt = performance.now();

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

      log.info("Invalidated queries", {
        keys,
        durationMs: Math.round(performance.now() - startedAt),
      });
    } catch (cause) {
      log.error("Could not invalidate queries", {
        keys,
        cause,
        durationMs: Math.round(performance.now() - startedAt),
      });
      this.toast.add({
        title: "Library refresh failed",
        description:
          "The change was saved, but your library could not be refreshed. Please try refreshing again.",
        color: "warning",
      });
    }
  }

  private async mutate<T>(action: string, mutation: () => Promise<T>): Promise<T> {
    const startedAt = performance.now();

    try {
      const result = await mutation();
      log.info("Executed mutation", {
        action,
        durationMs: Math.round(performance.now() - startedAt),
      });
      return result;
    } catch (cause) {
      log.error("Could not execute mutation", {
        action,
        cause,
        durationMs: Math.round(performance.now() - startedAt),
      });
      this.toast.add({
        title: "Action failed",
        description: `Could not ${action}.`,
        color: "error",
      });
      throw cause;
    }
  }

  private invalidateAfterCreate(...keys: EntryKey[]) {
    setTimeout(() => {
      this.invalidate(...keys);
    }, ms("5s"));
  }

  async setPinned(id: string, pinned: boolean) {
    if (pinned) await this.mutate("pin this item", () => this.client.library.pin(id));
    else await this.mutate("unpin this item", () => this.client.library.unpin(id));

    await this.invalidate(["libdata", "pins"]);
  }

  async createPlaylist(attributes: MutateLibraryPlaylist["attributes"], parentId: string) {
    const response = await this.mutate("create the playlist", () =>
      this.client.library.playlists.create(attributes, { parentId }),
    );
    this.invalidateAfterCreate(["libdata", "playlists", "list"]);
    return response.data[0];
  }

  async editPlaylist(playlist: AmLibraryPlaylist, attributes: MutateLibraryPlaylist["attributes"]) {
    await this.mutate("save changes to the playlist", () =>
      this.client.library.playlists.edit(playlist.id, attributes),
    );
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", playlist.id],
      ["libdata", "pins"],
    );
  }

  async deletePlaylist(playlist: AmLibraryPlaylist) {
    await this.mutate("delete the playlist", () =>
      this.client.library.playlists.delete(playlist.id),
    );
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", playlist.id],
      ["libdata", "playlists", "tracks", playlist.id],
      ["libdata", "pins"],
    );
  }

  async addPlaylistTracks(
    id: string,
    tracks: MutateRelationshipItems<MutateLibraryPlaylist, "tracks">,
  ) {
    await this.mutate("add the song to the playlist", () =>
      this.client.library.playlists.appendTracks(id, tracks),
    );
    this.invalidateAfterCreate(
      ["libdata", "playlists", "tracks", id],
      ["libdata", "playlists", "resource", id],
    );
  }

  async removePlaylistTrack(id: string, original: readonly AmLibrarySong[], index: number) {
    await this.mutate("remove the song from the playlist", () =>
      this.setPlaylistTracks(
        id,
        original.filter((_, i) => i !== index),
      ),
    );
    await this.invalidate(
      ["libdata", "playlists", "tracks", id],
      ["libdata", "playlists", "resource", id],
      ["libdata", "playlists", "list"],
      ["libdata", "pins"],
    );
  }

  async movePlaylist(id: string, parentId: string) {
    await this.mutate("move the playlist", () =>
      this.client.library.playlists.setParent(id, parentId),
    );
    await this.invalidate(
      ["libdata", "playlists", "list"],
      ["libdata", "playlists", "resource", id],
      ["libdata", "pins"],
    );
  }

  async reorderPlaylistTracks(id: string, tracks: readonly AmLibrarySong[]) {
    await this.mutate("reorder the playlist tracks", () => this.setPlaylistTracks(id, tracks));
    await this.invalidate(
      ["libdata", "playlists", "tracks", id],
      ["libdata", "playlists", "resource", id],
    );
  }

  private setPlaylistTracks(id: string, tracks: readonly AmLibrarySong[]) {
    return this.client.library.playlists.setTracks(
      id,
      tracks.map(({ id, type }) => ({ id, type })),
    );
  }

  async createPlaylistFolder(
    attributes: MutateLibraryPlaylistFolder["attributes"],
    parentId: string,
  ) {
    await this.mutate("create the folder", () =>
      this.client.library.playlistFolders.create(attributes, { parentId }),
    );
    this.invalidateAfterCreate(["libdata", "playlist-folders", "list"]);
  }

  async editPlaylistFolder(id: string, attributes: MutateLibraryPlaylistFolder["attributes"]) {
    await this.mutate("save changes to the folder", () =>
      this.client.library.playlistFolders.edit(id, attributes),
    );
    await this.invalidate(["libdata", "playlist-folders"]);
  }

  async deletePlaylistFolder(id: string) {
    await this.mutate("delete the folder", () => this.client.library.playlistFolders.delete(id));
    await this.invalidate(
      ["libdata", "playlist-folders"],
      ["libdata", "playlists"],
      ["libdata", "pins"],
    );
  }

  async movePlaylistFolder(id: string, parentId: string) {
    await this.mutate("move the folder", () =>
      this.client.library.playlistFolders.setParent(id, parentId),
    );
    await this.invalidate(["libdata", "playlist-folders"]);
  }

  async addToLibrary(id: string, type: "songs" | "albums") {
    await this.mutate("add the item to your library", () =>
      this.client.library.add({ [type]: [id] }),
    );
    this.invalidateAfterCreate(...invalidate.library(type, id));
  }

  async removeFromLibrary(id: string, type: "songs" | "albums", catalogId?: string) {
    await this.mutate("remove the item from your library", () =>
      this.client.library.remove(id, type),
    );
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
    await this.mutate("set the rating", () => this.client.me.ratings.set(id, type, rating));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, rating);
      this.history.updateRating(id, rating);
    }
    await this.invalidateResourceType(id, type, counterpartId);
  }

  async deleteRating(id: string, type: RateableResourceTypes, counterpartId?: string) {
    await this.mutate("remove the rating", () => this.client.me.ratings.delete(id, type));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, null);
      this.history.updateRating(id, null);
    }
    await this.invalidateResourceType(id, type, counterpartId);
  }
}
