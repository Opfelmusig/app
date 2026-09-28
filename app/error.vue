<template>
  <div
    class="flex size-full min-h-svh items-center justify-center overflow-hidden overflow-y-auto bg-stone-900 p-8 text-stone-200"
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
        <p v-if="message" class="text-base text-stone-400">
          {{ message }}
        </p>
        <div class="mt-4 flex gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-stone-950 transition-opacity hover:opacity-90"
            @click="clearError({ redirect: '/' })"
          >
            Home
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            @click="reload"
          >
            Reload
          </button>
        </div>
      </main>
      <div
        v-if="isDev && stack"
        class="h-max max-w-full overflow-hidden rounded-md"
        data-tauri-drag-region
      >
        <pre
          class="max-h-80 w-200 max-w-full overflow-auto bg-stone-800 p-3 px-4 text-left font-mono text-xs leading-5 break-all text-stone-300"
          v-html="stack"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError();

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
</script>
