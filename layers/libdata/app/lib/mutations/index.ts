import type { OpfelMusigClient } from "@opfelmusig/lib";
import type { RateableResourceTypes, RatingValue } from "@opfelmusig/lib/types";
import type { EntryKey, QueryCache } from "@pinia/colada";

const log = logger.withTag("mutations");

export class LibraryMutations {
  constructor(
    private client: OpfelMusigClient,
    private queryCache: QueryCache,
    private toast: ReturnType<typeof useToast>,
  ) {}

  async invalidate(...keys: [EntryKey, ...EntryKey[]]) {
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

  async mutate<T>(name: string, mutation: () => Promise<T>): Promise<T> {
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

  async invalidateResourceType(type: RateableResourceTypes) {
    if (type === "songs" || type === "library-songs") {
      await this.invalidate(
        ["libdata", "songs", "list"],
        ["libdata", "songs", "resource"],
        ["libdata", "albums", "tracks"],
        ["libdata", "playlists", "tracks"],
        ["libdata", "pins"],
        ["amdata", "songs", "resource"],
        ["amdata", "albums", "tracks"],
        ["amdata", "playlists", "tracks"],
        ["amdata", "artists", "views"],
        ["amdata", "home"],
        ["amdata", "search", "all"],
        ["amdata", "search", "songs"],
      );
    } else if (type === "albums" || type === "library-albums") {
      await this.invalidate(
        ["libdata", "albums", "list"],
        ["libdata", "albums", "resource"],
        ["libdata", "pins"],
        ["amdata", "albums", "resource"],
        ["amdata", "albums", "views"],
        ["amdata", "artists", "views"],
        ["amdata", "home"],
        ["amdata", "search", "all"],
        ["amdata", "search", "albums"],
      );
    } else if (type === "artists" || type === "library-artists") {
      await this.invalidate(
        ["libdata", "artists", "list"],
        ["libdata", "artists", "resource"],
        ["libdata", "pins"],
        ["amdata", "artists", "resource"],
        ["amdata", "artists", "views"],
        ["amdata", "playlists", "views"],
        ["amdata", "home"],
        ["amdata", "search", "all"],
        ["amdata", "search", "artists"],
      );
    } else if (type === "playlists" || type === "library-playlists") {
      await this.invalidate(
        ["libdata", "playlists", "list"],
        ["libdata", "playlists", "resource"],
        ["libdata", "pins"],
        ["amdata", "playlists", "resource"],
        ["amdata", "albums", "views"],
        ["amdata", "artists", "views"],
        ["amdata", "social-profiles", "shared-playlists"],
        ["amdata", "home"],
        ["amdata", "search", "all"],
        ["amdata", "search", "playlists"],
      );
    }
  }

  async setRating(id: string, type: RateableResourceTypes, rating: RatingValue) {
    await this.mutate("rating:add", () => this.client.me.ratings.set(id, type, rating));
    await this.invalidateResourceType(type);
  }

  async deleteRating(id: string, type: RateableResourceTypes) {
    await this.mutate("rating:remove", () => this.client.me.ratings.delete(id, type));
    await this.invalidateResourceType(type);
  }
}
