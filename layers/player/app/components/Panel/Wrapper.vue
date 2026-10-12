<template>
  <div
    ref="_el"
    class="fixed top-9.25 right-0 bottom-14.25 z-50 shrink-0 overflow-hidden pl-4 transition-transform select-none"
    :style="{ width: `${size + 16}px` }"
  >
    <div
      class="absolute inset-y-2 left-0 w-2 cursor-ew-resize touch-none"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
      @dblclick="onDoubleClick"
    />
    <div
      class="flex h-full w-full flex-col overflow-hidden overflow-y-auto border-l border-default bg-default shadow-xl"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const {
  el: _el,
  size,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
} = useResizable("opfelmusig:player-sidebar", {
  side: "right",
  unit: "px",
  minSize: 300,
  maxSize: 512,
  defaultSize: 448,
  collapsible: false,
  storage: "local",
});
</script>
