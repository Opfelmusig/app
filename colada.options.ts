import type { PiniaColadaOptions } from "@pinia/colada";
import { PiniaColadaAutoRefetch } from "@pinia/colada-plugin-auto-refetch";
import { PiniaColadaCachePersister } from "@pinia/colada-plugin-cache-persister";
import { createStore, del, get, set } from "idb-keyval";

const store = createStore("opfelmusig-cache", "query-cache");
const cacheKey = "queries-v1";
let clearingCache = false;

export async function clearPersistedQueryCache() {
  clearingCache = true;

  try {
    await del(cacheKey, store);
  } catch (cause) {
    clearingCache = false;
    throw cause;
  }
}

export default {
  plugins: [
    PiniaColadaCachePersister({
      key: cacheKey,
      filter: {
        predicate: ({ meta }) => meta.persist !== false,
      },
      storage: {
        async getItem(key: string) {
          return (await get<string>(key, store)) ?? null;
        },
        async setItem(key: string, value: string) {
          if (clearingCache) return;
          await set(key, value, store);
        },
        async removeItem(key: string) {
          await del(key, store);
        },
      },
    }),
    PiniaColadaAutoRefetch(),
  ],
} satisfies PiniaColadaOptions;
