<template>
  <div class="fixed top-9.25 right-0 bottom-14.25 z-50 shrink-0 overflow-hidden pl-4 select-none">
    <div ref="_el" class="relative size-full" :style="{ width: `${size}px` }">
      <div
        class="peer absolute inset-y-0 left-0 z-50 w-2 -translate-x-1 cursor-ew-resize touch-none"
        @mousedown="onMouseDown"
        @touchstart="onTouchStart"
        @dblclick="onDoubleClick"
      />
      <div
        class="flex size-full flex-col overflow-hidden border-l border-default bg-default shadow-xl transition-colors peer-hover:border-accented peer-active:border-accented"
      >
        <slot />
      </div>
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
} = useResizable("opfelmusig:player-panel", {
  side: "right",
  unit: "px",
  minSize: 300,
  maxSize: 512,
  defaultSize: 400,
  collapsible: false,
  storage: "local",
});
</script>
