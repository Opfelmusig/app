<template>
  <div
    ref="scroll-area"
    :style="style"
    class="scrollbar-hide flex h-full flex-col gap-1 overflow-hidden overflow-y-auto"
  >
    <SidebarItemIcon icon="lucide:corner-up-left" to="/">Back</SidebarItemIcon>
  </div>
</template>

<script lang="ts" setup>
const scrollArea = useTemplateRef("scroll-area");
const { style } = useScrollShadow(scrollArea, {
  orientation: "vertical",
});
</script>
