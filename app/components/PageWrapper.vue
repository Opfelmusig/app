<template>
  <div
    ref="scroller"
    class="relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden overflow-y-auto"
    :style
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const scroller = useTemplateRef("scroller");
const { style } = useCustomScrollShadow(scroller, {
  sizeStart: 0,
});
</script>
