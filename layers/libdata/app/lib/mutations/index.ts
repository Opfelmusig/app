import type { OpfelMusigClient } from "@opfelmusig/lib";
import type { EntryKey, QueryCache } from "@pinia/colada";

const log = logger.withTag("mutations");

export class LibraryMutations {
  constructor(
    private client: OpfelMusigClient,
    private queryCache: QueryCache,
    private toast: ReturnType<typeof useToast>,
  ) {}

  async invalidate(key: EntryKey) {
    try {
      await this.queryCache.invalidateQueries({
        key,
      });
    } catch (cause) {
      log.error("Could not invalidate queries", { key, cause });
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

  async pin(id: string) {
    await this.mutate("pin", () => this.client.library.pin(id));
    await this.invalidate(["libdata", "pins"]);
  }

  async unpin(id: string) {
    await this.mutate("unpin", () => this.client.library.unpin(id));
    await this.invalidate(["libdata", "pins"]);
  }
}
