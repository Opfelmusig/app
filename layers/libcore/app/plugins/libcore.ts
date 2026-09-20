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
      return (initializePromise ??= initializeSync()
        .catch((cause) => {
          log.error("Library initialization failed", { cause });
        })
        .finally(() => {
          initializePromise = null;
        }));
    }

    async function initializeSync() {
      log.info("Checking local library state");

      const dbState = await client.state();

      if (dbState?.lastSyncedAt && dbState?.profileId !== auth.profileId.value) {
        log.warn("Local library belongs to a different account, clearing cached data");

        await clearData();
        startSync().catch(() => undefined);

        return;
      }

      if (dbState?.lastSyncedAt) {
        log.info("Loaded existing library state", { lastSyncedAt: dbState.lastSyncedAt });

        state.ready = true;
        state.syncing = false;
        state.lastSyncedAt = dbState.lastSyncedAt;

        return;
      }

      startSync().catch(() => undefined);
    }

    async function startSync() {
      if (!auth.valid.value) return;

      log.debug("Library sync requested", { alreadyRunning: syncPromise !== null });

      return (syncPromise ??= sync().finally(() => {
        syncPromise = null;
      }));
    }

    async function sync() {
      const startedAt = performance.now();

      log.info("Library sync started");

      error.value = null;
      state.syncing = true;
      syncController = new AbortController();

      try {
        if (!auth.profileId.value) {
          throw new Error("Profile ID not found");
        }

        const lastSyncedAt = await syncAppleMusic(
          db,
          opfelmusig,
          auth.profileId.value,
          syncController.signal,
          progress,
        );

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
        log.error("Library sync failed", { cause });

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

    async function clearData() {
      error.value = null;
      resetProgress();

      await client.delete();

      queryCache.cancelQueries({ key: ["libcore"] });
      for (const entry of queryCache.getEntries({ key: ["libcore"] })) {
        queryCache.remove(entry);
      }

      state.ready = false;
      state.syncing = false;
      state.lastSyncedAt = undefined;
    }

    async function clear() {
      log.info("Clearing local library");

      state.ready = false;
      syncController?.abort();

      await Promise.allSettled([initializePromise, syncPromise].filter(Boolean));

      log.debug("Library operations stopped");

      await clearData();

      log.info("Local library cleared");
    }

    nuxtApp.hook("auth:logout", clear);

    if (auth.valid.value) {
      log.info("Authenticated at startup, initializing library");
      initialize();
    } else {
      log.info("Unauthenticated at startup, library initialization deferred");
    }

    watch(auth.valid, (valid) => {
      if (valid) {
        log.info("Authentication established, initializing library");
        initialize();
      }
    });

    return {
      provide: {
        library: {
          client,
          sync: startSync,
          state: readonly(state),
          progress: readonly(progress),
          error: readonly(error),
        },
      },
    };
  },
});
