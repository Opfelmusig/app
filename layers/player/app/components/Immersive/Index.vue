<template>
  <div
    class="fixed inset-0 z-100 flex size-full shrink-0 flex-col overflow-hidden rounded-xl bg-default select-none"
  >
    <ImmersiveHeader />

    <div class="flex min-h-0 flex-1">
      <div class="relative flex size-full flex-col items-center justify-between">
        <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-t-xl">
          <ImmersiveMesh />
          <ImmersiveArtwork />
        </div>

        <div class="z-30 flex h-full w-120 overflow-hidden pb-12">
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

        <div class="absolute z-30 flex size-full items-end justify-center p-2">
          <ImmersivePlayer />
        </div>
      </div>

      <ImmersiveSidebar />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
