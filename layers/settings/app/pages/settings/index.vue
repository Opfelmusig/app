<template>
  <SettingsWrapper>
    <SettingsSection title="Sidebar">
      <SettingsToggle v-model="settingsStore.sidebarSections.pins.hidden" label="Hide pins" />
      <SettingsToggle v-model="settingsStore.sidebarSections.library.hidden" label="Hide library" />
      <SettingsToggle
        v-model="settingsStore.sidebarSections.playlists.hidden"
        label="Hide playlists"
      />
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
