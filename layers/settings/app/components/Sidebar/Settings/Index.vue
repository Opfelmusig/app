<template>
  <div class="flex size-full flex-col overflow-hidden pt-2">
    <div class="flex flex-col gap-2">
      <SidebarItemIcon icon="lucide:arrow-left" :to="lastNonSettingsPage" variant="dimmed">
        Back
      </SidebarItemIcon>
      <SidebarBorder />
    </div>
    <div
      ref="scroll-area"
      :style="style"
      class="scrollbar-hide flex h-full flex-col gap-1 overflow-hidden overflow-y-auto py-2"
    >
      <SidebarItemIcon icon="lucide:settings-2" to="/settings">General</SidebarItemIcon>
      <SidebarItemIcon icon="lucide:user" to="/settings/account">Account</SidebarItemIcon>
      <SidebarSection label="Music">
        <SidebarItemIcon icon="lucide:play" to="/settings/player">Player</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:music" to="/settings/playback">Playback</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:picture-in-picture-2" to="/settings/widgets">
          Widgets
        </SidebarItemIcon>
      </SidebarSection>
      <SidebarSection label="Help & Data">
        <SidebarItemIcon icon="lucide:info" to="/settings/about">Updates & About</SidebarItemIcon>
        <SidebarItemIcon icon="lucide:database" to="/settings/storage">
          Storage & Library
        </SidebarItemIcon>
        <SidebarItemIcon icon="lucide:keyboard" to="/settings/shortcuts">Shortcuts</SidebarItemIcon>
      </SidebarSection>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const lastNonSettingsPage = ref("/");

watch(
  () => route.fullPath,
  (fullPath) => {
    if (route.path !== "/settings" && !route.path.startsWith("/settings/")) {
      lastNonSettingsPage.value = fullPath;
    }
  },
  { immediate: true },
);

const scrollArea = useTemplateRef("scroll-area");
const { style } = useCustomScrollShadow(scrollArea, {
  orientation: "vertical",
  offset: 4,
});
</script>
