import { LibraryClient } from "#layers/libcore/app/database/client";
import { LibraryDatabase } from "#layers/libcore/app/database/dexie";
import { refreshArtworks } from "#layers/libcore/app/lib/refreshArtworks";
import { syncAppleMusicLibrary } from "#layers/libcore/app/lib/sync";

export const OPFELMUSIG_LIBRARY_VERSION = 0;

export interface LibraryState {
  ready: boolean;
  initializing: boolean;
  syncing: boolean;
  lastSyncedAt?: Date;
}

export interface LibraryProgressResource {
  count: number;
  done: boolean;
}

export interface LibraryProgress {
  state: "idle" | "fetching" | "writing";
  songs: LibraryProgressResource;
}

export default defineNuxtPlugin({
  name: "libcore:ready",
  dependsOn: ["session:ready"],
  setup: async (nuxtApp) => {
    if (isMiniplayer) return {};

    const log = logger.withTag("libcore");

    const opfelmusig = useClient();
    const auth = useAuth();
    const queryCache = useQueryCache();

    const db = new LibraryDatabase("opfelmusig-library");
    const client = new LibraryClient(db);

    let syncController: AbortController | null = null;
    let syncPromise: Promise<void> | null = null;
    let initializePromise: Promise<void> | null = null;
    let artworkRefreshController: AbortController | null = null;
    let artworkRefreshPromise: Promise<void> | null = null;

    const state = reactive<LibraryState>({
      ready: false,
      initializing: false,
      syncing: false,
    });
    const progress = reactive<LibraryProgress>({
      state: "idle",
      songs: { count: 0, done: false },
    });
    const isRefreshingArtworks = ref(false);
    const error = ref<Error | null>(null);

    const hasFailed = computed(
      () => !state.ready && !state.initializing && !state.syncing && !!error.value,
    );

    function resetProgress() {
      progress.state = "idle";
      progress.songs = { count: 0, done: false };
    }

    function initialize() {
      if (initializePromise) return initializePromise;

      state.initializing = true;

      initializePromise = initializeSync()
        .catch((cause) => {
          log.error("Library initialization failed", { cause });

          if (cause instanceof Error) {
            error.value = cause;
          } else {
            error.value = new Error("Unknown error");
          }
        })
        .finally(() => {
          state.initializing = false;
          initializePromise = null;
        });

      return initializePromise;
    }

    async function initializeSync() {
      log.info("Checking local library state");

      const dbState = await client.state();

      if (dbState?.lastSyncedAt && dbState?.profileId !== auth.profile.value?.id) {
        log.warn("Local library belongs to a different account, clearing cached data");

        await clearData();
        startSync().catch(() => undefined);

        return;
      }

      if (dbState && dbState.version !== OPFELMUSIG_LIBRARY_VERSION) {
        log.warn("Local library cache is outdated, clearing cached data");

        await clearData();
        startSync().catch(() => undefined);

        return;
      }

      if (dbState?.lastSyncedAt) {
        state.ready = true;
        state.syncing = false;
        state.lastSyncedAt = dbState.lastSyncedAt;

        log.info("Loaded existing library state", {
          lastSyncedAt: dbState.lastSyncedAt,
        });

        startArtworkRefresh();

        return;
      }

      startSync().catch(() => undefined);
    }

    async function manualSync() {
      await initializePromise;
      return startSync();
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

      artworkRefreshController?.abort();
      await artworkRefreshPromise;

      log.info("Library sync started");

      error.value = null;
      state.syncing = true;
      syncController = new AbortController();

      try {
        if (!auth.profile.value?.id) {
          throw new Error("Profile ID not found");
        }

        resetProgress();

        const lastSyncedAt = await syncAppleMusicLibrary(
          db,
          opfelmusig,
          auth.profile.value?.id,
          syncController.signal,
          progress,
        );

        state.ready = true;
        state.lastSyncedAt = lastSyncedAt;

        await queryCache.invalidateQueries({ key: ["libcore"] });

        log.info("Library sync completed", {
          durationMs: Math.round(performance.now() - startedAt),
          songs: progress.songs,
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
      artworkRefreshController?.abort();

      await Promise.allSettled(
        [initializePromise, syncPromise, artworkRefreshPromise].filter(Boolean),
      );

      log.debug("Library operations stopped");

      await clearData();

      log.info("Local library cleared");
    }

    async function startArtworkRefresh() {
      if (artworkRefreshPromise) return artworkRefreshPromise;

      artworkRefreshPromise = prepareArtworkRefresh()
        .catch((cause) => {
          log.error("Artwork refresh failed", { cause });
        })
        .finally(() => {
          artworkRefreshPromise = null;
        });

      return artworkRefreshPromise;
    }

    async function prepareArtworkRefresh() {
      if (!state.ready || state.syncing) return;

      artworkRefreshController = new AbortController();
      isRefreshingArtworks.value = true;

      try {
        const updated = await refreshArtworks(db, opfelmusig, artworkRefreshController.signal);

        if (updated) {
          await queryCache.invalidateQueries({ key: ["libcore"] });
        }
      } finally {
        artworkRefreshController = null;
        isRefreshingArtworks.value = false;
      }
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

    setInterval(startArtworkRefresh, ms("1h"));

    return {
      provide: {
        library: {
          client,
          sync: manualSync,
          state: readonly(state),
          progress: readonly(progress),
          error: readonly(error),
          hasFailed,
        },
      },
    };
  },
});
