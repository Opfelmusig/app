<template>
  <div class="flex size-full flex-col overflow-hidden pb-2">
    <div
      ref="scroll-area"
      :style="style"
      class="scrollbar-hide flex h-full flex-col gap-1 overflow-hidden overflow-y-auto py-2"
    >
      <SidebarItemIcon icon="lucide:search" to="/search">Search</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:house" to="/">Home</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:list-video" to="/history">History</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:settings" to="/settings">Settings</SidebarItemIcon>
      <SidebarSection
        v-if="!settingsStore.sidebarSections.pins.hidden"
        v-model="settingsStore.sidebarSections.pins.collapsed"
        label="Pins"
        collapsible
      >
        <SidebarPins />
      </SidebarSection>
      <SidebarSection
        v-if="!settingsStore.sidebarSections.library.hidden"
        v-model="settingsStore.sidebarSections.library.collapsed"
        label="Library"
        collapsible
      >
        <SidebarItemIcon icon="lucide:music-2" to="/library/songs">Songs</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:disc" to="/library/albums">Albums</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:mic-vocal" to="/library/artists">Artists</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:guitar" to="/library/genres">Genres</SidebarItemIcon>
        <SidebarItemIcon
          v-if="isCollapsed || settingsStore.sidebarSections.playlists.hidden"
          to="/resources/library-playlist-folders"
          icon="lucide:list-music"
        >
          Playlists
        </SidebarItemIcon>
      </SidebarSection>
      <SidebarSection
        v-if="!isCollapsed && !settingsStore.sidebarSections.playlists.hidden"
        v-model="settingsStore.sidebarSections.playlists.collapsed"
        label="Playlists"
        collapsible
      >
        <SidebarPlaylists />
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

const { isCollapsed } = useSidebar();

const scrollArea = useTemplateRef("scroll-area");
const { style } = useCustomScrollShadow(scrollArea, {
  orientation: "vertical",
  offset: 4,
});
</script>
