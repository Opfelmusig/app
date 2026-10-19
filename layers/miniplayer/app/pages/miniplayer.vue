<template>
  <main class="relative flex h-svh overflow-hidden text-white select-none" data-tauri-drag-region>
    <button
      v-if="!isMacos"
      type="button"
      class="absolute top-1 right-1 z-20 flex size-5 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
      @click="close"
    >
      <OMIcon name="lucide:x" class="size-3.5" />
    </button>

    <div
      v-if="!track"
      class="flex size-full items-center justify-center gap-2 text-xs text-white/50"
      data-tauri-drag-region
    >
      <OMIcon name="lucide:music" class="pointer-events-none size-4" />
      <span class="pointer-events-none">Nothing playing</span>
    </div>

    <template v-else>
      <AMArtworkWrapper
        :resource="track"
        context="grid"
        :class="
          artworkLayout ? 'absolute inset-0 size-full rounded-none' : 'size-20 w-20 rounded-none'
        "
        data-tauri-drag-region
      >
        <AMArtworkImage :width="artworkLayout ? 560 : 160" class="pointer-events-none" />
        <AMArtworkPlaceholder class="pointer-events-none size-6" />
      </AMArtworkWrapper>
      <div
        v-if="artworkLayout"
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-[#171717] via-black/60 to-transparent"
      />

      <div
        class="relative flex min-w-0 flex-1 flex-col"
        :class="artworkLayout ? 'justify-end gap-3 p-3 pt-8' : 'justify-between gap-1 p-2 pt-1'"
        data-tauri-drag-region
      >
        <div
          class="min-w-0"
          :class="!artworkLayout && !isMacos ? 'pr-5' : ''"
          data-tauri-drag-region
        >
          <OMScrollingTextGroup :key="track.id" class="pointer-events-none min-w-0">
            <OMScrollingText class="text-sm font-semibold">{{
              track.attributes.name
            }}</OMScrollingText>
            <OMScrollingText
              v-if="artworkLayout && track.attributes.artistName"
              class="text-xs text-white/60"
            >
              {{ track.attributes.artistName }}
            </OMScrollingText>
          </OMScrollingTextGroup>
        </div>

        <PlayerProgress
          :key="track.id"
          :position
          :duration
          :disabled="loading"
          size="xs"
          class="gap-2 text-[10px] text-white/60"
          data-tauri-drag-region
          @seek="seek"
        />
        <PlayerControls
          :paused
          :loading
          :size="artworkLayout ? 'sm' : 'xs'"
          class="justify-center text-white"
          :class="artworkLayout ? 'gap-4' : 'gap-2'"
          data-tauri-drag-region
          @previous="run('previous')"
          @toggle="run('toggle')"
          @next="run('next')"
        />
      </div>
    </template>
  </main>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false });

const { $mainBridge } = useNuxtApp();
const log = logger.withTag("miniplayer");
const miniplayerStore = useMiniplayerStore();
const { layout, track, position, paused, loading } = storeToRefs(miniplayerStore);
const artworkLayout = computed(() => layout.value === "artwork");
const duration = computed(() => (track.value?.attributes.durationInMillis ?? 0) / 1000);

function run(action: "previous" | "toggle" | "next") {
  $mainBridge[action]().catch((cause) =>
    log.error("Could not control playback", { action, cause }),
  );
}

function seek(seconds: number) {
  miniplayerStore.updatePosition(seconds);
  $mainBridge.seek(seconds).catch((cause) => log.error("Could not seek playback", { cause }));
}

function close() {
  currentWindow.close().catch((cause) => log.error("Could not close the miniplayer", { cause }));
}

useKeybind([
  {
    keys: "space",
    run: () => run("toggle"),
    config: {
      prevent: true,
      ignoreRepeat: true,
      ignoreIfEditable: true,
      when: ({ event }) =>
        !!track.value &&
        !loading.value &&
        !(event.target instanceof Element && event.target.closest("button")),
    },
  },
  { keys: "escape", run: close, config: { prevent: true, ignoreRepeat: true } },
]);
</script>
