<template>
  <main class="relative flex size-full h-svh flex-col overflow-hidden" :style="cssVars">
    <Titlebar />
    <div class="flex size-full overflow-hidden">
      <USplitter
        id="main-layout"
        ref="_splitter"
        auto-save-id="main-layout"
        :items="panels"
        class="size-full overflow-hidden"
        :ui="{
          handle:
            'w-px bg-border transition-colors focus-visible:outline-(--ui-border-accented) data-[state=drag]:bg-(--ui-border-accented) data-[state=hover]:bg-(--ui-border-accented)',
        }"
      >
        <template #sidebar>
          <Sidebar />
        </template>
        <template #main>
          <slot />
        </template>
        <template #resize-handle>
          <div class="absolute -inset-x-1.25 inset-y-0 z-10" @dblclick.stop.prevent="reset" />
        </template>
      </USplitter>
    </div>
    <Transition
      enter-active-class="transition-transform"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform"
      leave-to-class="translate-x-full"
    >
      <Panel v-if="settingsStore.panel.isOpen" />
    </Transition>
    <Transition
      persisted
      enter-active-class="transition-transform duration-400"
      enter-from-class="translate-y-full"
      leave-active-class="transition-transform duration-400"
      leave-to-class="translate-y-full"
      @after-leave="immersiveMounted = false"
    >
      <Immersive v-if="immersiveMounted" v-show="settingsStore.immersive.isOpen" />
    </Transition>
    <Player />
    <Settings />
  </main>
</template>

<script lang="ts" setup>
import type { SplitterItem } from "@nuxt/ui";

const { cssVars } = useArtworkTheme();

const panels: SplitterItem[] = [
  {
    slot: "sidebar",
    sizeUnit: "px",
    minSize: 200,
    maxSize: 320,
    defaultSize: 260,
    collapsible: true,
    collapsedSize: 56,
  },
  { slot: "main", minSize: 0 },
];

const { splitter: _splitter, reset } = useSidebar();
const settingsStore = useSettingsStore();

const immersiveMounted = ref(settingsStore.immersive.isOpen);
watch(
  () => settingsStore.immersive.isOpen,
  (isOpen) => {
    if (isOpen) immersiveMounted.value = true;
  },
);
</script>
