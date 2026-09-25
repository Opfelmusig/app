<template>
  <div
    class="flex size-full shrink-0 flex-col overflow-hidden bg-muted/20 p-2 whitespace-nowrap select-none"
  >
    <div
      ref="scroll-area"
      :style="style"
      class="scrollbar-hide flex h-full flex-col gap-1 overflow-hidden overflow-y-auto pb-2"
    >
      <SidebarItemIcon icon="lucide:search" to="/search">Search</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:house" to="/">Home</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:list-video" to="/history">History</SidebarItemIcon>
      <SidebarSection
        v-if="!settingsStore.sidebarSections.pins.hidden"
        v-model="settingsStore.sidebarSections.pins.collapsed"
        label="Pins"
      >
      </SidebarSection>
    </div>
    <div class="flex flex-col gap-2">
      <SidebarBorder />
      <div class="flex flex-col">
        <SidebarUser />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const scrollArea = useTemplateRef("scroll-area");
const { style } = useScrollShadow(scrollArea, {
  orientation: "vertical",
});
</script>
