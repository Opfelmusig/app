import type { RateableResourceTypes, RatingValue } from "@opfelmusig/lib/types";
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

  private async invalidateResourceType(type: RateableResourceTypes) {
    if (type === "songs" || type === "library-songs") {
      await this.invalidate(...invalidate.songs);
    } else if (type === "albums" || type === "library-albums") {
      await this.invalidate(...invalidate.albums);
    } else if (type === "artists" || type === "library-artists") {
      await this.invalidate(...invalidate.artists);
    } else if (type === "playlists" || type === "library-playlists") {
      await this.invalidate(...invalidate.playlists);
    }
  }

  async setRating(id: string, type: RateableResourceTypes, rating: RatingValue) {
    await this.mutate("rating:add", () => this.client.me.ratings.set(id, type, rating));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, rating);
      this.history.updateRating(id, rating);
    }
    await this.invalidateResourceType(type);
  }

  async deleteRating(id: string, type: RateableResourceTypes) {
    await this.mutate("rating:remove", () => this.client.me.ratings.delete(id, type));
    if (type === "songs" || type === "library-songs") {
      this.queue.updateRating(id, null);
      this.history.updateRating(id, null);
    }
    await this.invalidateResourceType(type);
  }
}
