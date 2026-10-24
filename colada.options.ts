import type { PiniaColadaOptions } from "@pinia/colada";
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
        ({ queryCache }) => {
          const log = logger.withTag("query");

          queryCache.$onAction(({ name, args, after, onError }) => {
            if (name !== "fetch") return;

            const entry = args[0];
            const startedAt = performance.now();

            after(() => {
              const durationMs = Math.round(performance.now() - startedAt);

              if (durationMs < ms("2s")) {
                log.debug("Query completed", {
                  key: entry.key,
                  durationMs,
                });
              } else {
                log.info("Slow query", {
                  key: entry.key,
                  durationMs,
                });
              }
            });

            onError((cause) => {
              if (entry.state.value.error !== cause) return;

              log.error("Query failed", {
                key: entry.key,
                cause,
                durationMs: Math.round(performance.now() - startedAt),
              });
            });
          });
        },
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
