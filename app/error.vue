<template>
  <div
    class="flex size-full min-h-svh items-center justify-center overflow-hidden overflow-y-auto bg-neutral-900 p-8 text-neutral-200"
    data-tauri-drag-region
  >
    <div class="flex w-200 max-w-full flex-col gap-8" data-tauri-drag-region>
      <main class="flex min-h-max flex-col items-center gap-2 text-center" data-tauri-drag-region>
        <p v-if="status" class="text-base font-semibold text-primary">
          {{ status }}
        </p>
        <h1 class="text-3xl font-bold text-white sm:text-4xl">
          {{ title }}
        </h1>
        <p v-if="message" class="text-base text-neutral-400">
          {{ message }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-90"
            @click="clearError({ redirect: '/' })"
          >
            Home
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            @click="reload"
          >
            Reload
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-50"
            :disabled="clearingCache"
            @click="clearCache"
          >
            {{ clearingCache ? "Clearing cache..." : "Clear cache and reload" }}
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md bg-red-400 px-4 py-2 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            :disabled="loggingOut"
            @click="logout"
          >
            {{ loggingOut ? "Logging out..." : "Log out" }}
          </button>
        </div>
        <p v-if="cacheError" class="text-sm text-red-400">{{ cacheError }}</p>
        <p v-if="logoutError" class="text-sm text-red-400">{{ logoutError }}</p>
      </main>
      <div
        v-if="isDev && stack"
        class="h-max max-w-full overflow-hidden rounded-md"
        data-tauri-drag-region
      >
        <pre
          class="max-h-80 w-200 max-w-full overflow-auto bg-neutral-800 p-3 px-4 text-left font-mono text-xs leading-5 break-all text-neutral-300"
          v-html="stack"
        />
      </div>
    </div>
    <div class="absolute bottom-4 flex w-full justify-center">
      <UpdaterButtons />
    </div>
  </div>
</template>

<script setup lang="ts">
import { clearPersistedQueryCache } from "~~/colada.options";

import { removeStoredUserToken } from "#layers/session/app/lib/credentials";

const error = useError();

onMounted(() => {
  if (!error.value) return;

  logger.withTag("app").error("Application error", {
    cause: error.value,
    route: window.location.pathname,
    window: currentWindow.label,
  });
});

const isDev = import.meta.dev;

const status = computed(() => error.value?.status ?? error.value?.statusCode);
const title = computed(
  () => error.value?.statusText ?? error.value?.statusMessage ?? "Something went wrong",
);
const message = computed(() => {
  const message = error.value?.message;

  if (!message || message === title.value) return;

  return message;
});

const stack = computed(() => {
  const stack = error.value?.stack;

  if (!stack) return;

  return stack.replace("\nat ", "\n\nat ");
});

function reload() {
  window.location.reload();
}

const loggingOut = ref(false);
const logoutError = ref<string>();

async function logout() {
  if (loggingOut.value) return;

  loggingOut.value = true;
  logoutError.value = undefined;

  try {
    await removeStoredUserToken();

    clearSessionStorage();

    reload();
  } catch (cause) {
    logger.withTag("auth").error("Could not log out", { cause });
    logoutError.value = cause instanceof Error ? cause.message : "Could not log out. Try again.";
  } finally {
    loggingOut.value = false;
  }
}

const queryCache = useQueryCache();
const clearingCache = ref(false);
const cacheError = ref<string>();

async function clearCache() {
  if (clearingCache.value) return;

  clearingCache.value = true;
  cacheError.value = undefined;

  try {
    queryCache.cancelQueries();
    for (const entry of queryCache.getEntries()) queryCache.remove(entry);
    await clearPersistedQueryCache();
    reload();
  } catch (cause) {
    logger.withTag("cache").error("Failed to clear cached data", { cause });
    cacheError.value = "Could not clear the cache. Please try again.";
  } finally {
    clearingCache.value = false;
  }
}
</script>
