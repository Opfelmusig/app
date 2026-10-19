import { PiniaColadaQueryHooksPlugin, type PiniaColadaOptions } from "@pinia/colada";
import { PiniaColadaAutoRefetch } from "@pinia/colada-plugin-auto-refetch";
import { PiniaColadaCachePersister } from "@pinia/colada-plugin-cache-persister";
import { parse, stringify } from "devalue";
import { createStore, del, get, set } from "idb-keyval";

import { logger } from "./app/utils/logger";

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
  plugins: isMiniplayer
    ? []
    : [
        PiniaColadaQueryHooksPlugin({
          onError(cause, entry) {
            logger.withTag("query").error("Query failed", { cause, key: entry.key });
          },
        }),
        PiniaColadaCachePersister({
          key: cacheKey,
          stringify,
          parse,
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
