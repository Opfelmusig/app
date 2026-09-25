<template>
  <div class="relative flex size-full h-svh flex-col overflow-hidden">
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
            'w-px transition-colors bg-border data-[state=hover]:bg-(--ui-border-accented) data-[state=drag]:bg-(--ui-border-accented) focus-visible:outline-(--ui-border-accented)',
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
  </div>
</template>

<script lang="ts" setup>
import type { SplitterItem } from "@nuxt/ui";

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
</script>
