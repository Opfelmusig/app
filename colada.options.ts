import type { PiniaColadaOptions } from "@pinia/colada";
import { PiniaColadaAutoRefetch } from "@pinia/colada-plugin-auto-refetch";
import { PiniaColadaCachePersister } from "@pinia/colada-plugin-cache-persister";
import { createStore, del, get, set } from "idb-keyval";

const store = createStore("opfelmusig-cache", "query-cache");

export default {
  plugins: [
    PiniaColadaCachePersister({
      key: "queries-v1",
      storage: {
        async getItem(key: string) {
          return (await get<string>(key, store)) ?? null;
        },
        async setItem(key: string, value: string) {
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
