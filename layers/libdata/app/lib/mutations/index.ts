import type { OpfelMusigClient } from "@opfelmusig/lib";
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
}
