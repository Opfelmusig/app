import { LibraryClient } from "#layers/libcore/app/database/client";
import { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import { syncAppleMusic } from "#layers/libcore/app/lib/sync";
import { logger } from "~/lib/logger";

export interface LibraryState {
  ready: boolean;
  syncing: boolean;
  lastSyncedAt?: Date;
}

export interface LibraryProgress {
  state: "idle" | "fetching" | "writing";
  songs: number;
  albums: number;
  artists: number;
  playlists: number;
}

export default defineNuxtPlugin({
  name: "libcore:ready",
  dependsOn: ["client:ready"],
  setup: async (nuxtApp) => {
    const log = logger.withTag("libcore");

    const opfelmusig = useClient();
    const auth = useAuth();
    const queryCache = useQueryCache();

    const db = new LibraryDatabase("opfelmusig-library");
    const client = new LibraryClient(db);

    let syncController: AbortController | null = null;
    let syncPromise: Promise<void> | null = null;
    let initializePromise: Promise<void> | null = null;

    const state = reactive<LibraryState>({
      ready: false,
      syncing: false,
    });
    const progress = reactive<LibraryProgress>({
      state: "idle",
      songs: 0,
      albums: 0,
      artists: 0,
      playlists: 0,
    });
    const error = ref<Error | null>(null);

    function resetProgress() {
      progress.state = "idle";
      progress.songs = 0;
      progress.albums = 0;
      progress.artists = 0;
      progress.playlists = 0;
    }

    function initialize() {
      return (initializePromise ??= initializeSync().finally(() => {
        initializePromise = null;
      }));
    }

    async function initializeSync() {
      log.info("Initialized sync");

      const dbState = await client.state();

      if (dbState?.lastSyncedAt) {
        log.info("Already synced", { lastSyncedAt: dbState.lastSyncedAt });

        state.ready = true;
        state.syncing = false;
        state.lastSyncedAt = dbState.lastSyncedAt;

        return;
      }

      startSync().catch(() => undefined);
    }

    async function startSync() {
      if (!auth.valid.value) return;

      log.debug("Requesting sync");

      return (syncPromise ??= sync().finally(() => {
        syncPromise = null;
      }));
    }

    async function sync() {
      const startedAt = performance.now();

      log.info("Started syncing");

      error.value = null;
      state.syncing = true;
      syncController = new AbortController();

      try {
        const lastSyncedAt = await syncAppleMusic(db, opfelmusig, syncController.signal, progress);

        state.ready = true;
        state.lastSyncedAt = lastSyncedAt;

        await queryCache.invalidateQueries({ key: ["libcore"] });

        log.info("Library sync completed", {
          durationMs: Math.round(performance.now() - startedAt),
          songs: progress.songs,
          albums: progress.albums,
          artists: progress.artists,
          playlists: progress.playlists,
        });
      } catch (cause) {
        log.error("Syncing failed", { cause });

        if (cause instanceof Error) {
          error.value = cause;
        } else {
          error.value = new Error("Unknown error");
        }

        throw cause;
      } finally {
        state.syncing = false;
        resetProgress();
        syncController = null;
      }
    }

    async function clear() {
      log.info("Clearing data");

      state.ready = false;
      syncController?.abort();

      await Promise.allSettled([initializePromise, syncPromise].filter(Boolean));

      log.debug("All promises settled");

      error.value = null;
      resetProgress();

      await client.delete();

      queryCache.cancelQueries({ key: ["libcore"] });
      for (const entry of queryCache.getEntries({ key: ["libcore"] })) {
        queryCache.remove(entry);
      }

      syncController = null;

      state.ready = false;
      state.syncing = false;
      state.lastSyncedAt = undefined;

      log.info("All data cleared");
    }

    nuxtApp.hook("auth:logout", clear);

    if (auth.valid.value) {
      log.info("Already logged in starting sync");
      await initialize();
    } else {
      log.info("Not logged in wating to sync");
    }

    watch(auth.valid, (valid) => {
      if (valid) {
        log.info("Logged in starting sync");
        initialize().catch((cause) => {
          log.error("Initializing sync failed", { cause });
        });
      }
    });

    return {
      provide: {
        library: {
          client,
          sync: startSync,
          clear,
          state: readonly(state),
          progress: readonly(progress),
          error: readonly(error),
        },
      },
    };
  },
});
