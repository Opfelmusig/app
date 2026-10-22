<template>
  <div
    class="fixed inset-0 z-100 flex size-full shrink-0 flex-col overflow-hidden bg-default select-none"
  >
    <ImmersiveHeader />

    <div
      class="pointer-events-none absolute inset-0 overflow-hidden transition-[padding]"
      :style="{ maskImage: settingsStore.immersive.enhanced ? maskImage : undefined }"
      :class="settingsStore.immersive.queue ? 'pr-100' : 'pr-0'"
    >
      <div class="relative size-full overflow-hidden">
        <ImmersiveMesh v-if="settingsStore.immersive.enhanced" />
        <ImmersiveArtwork />
      </div>
    </div>

    <div class="flex min-h-0 flex-1">
      <div class="relative flex size-full flex-col items-center justify-between">
        <div class="z-40 flex h-full w-120 overflow-hidden pb-12">
          <Transition
            enter-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity"
            leave-to-class="opacity-0"
          >
            <div v-if="settingsStore.immersive.lyrics" class="flex size-full overflow-hidden">
              <Lyrics />
            </div>
          </Transition>
        </div>

        <div class="pointer-events-none absolute z-50 flex size-full items-end justify-center p-2">
          <ImmersivePlayer />
        </div>
      </div>

      <ImmersiveSidebar />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const stops = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const position = 3 * (1 - t) ** 2 * t * 0.42 + 3 * (1 - t) * t ** 2 * 0.58 + t ** 3;
  const opacity = 1 - 0.5 * (3 * (1 - t) * t ** 2 + t ** 3);
  const offset = 80 * (1 - position);

  return `rgb(0 0 0 / ${opacity.toFixed(5)}) calc(100% - ${offset.toFixed(5)}px)`;
});

const maskImage = `linear-gradient(to top, black 0%, ${stops.join(", ")})`;
</script>
