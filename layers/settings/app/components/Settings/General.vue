<template>
  <SettingsWrapper>
    <SettingsSection title="System">
      <SettingsToggle
        v-model="settingsStore.system.minimizeToTray"
        label="Minimize to tray"
        description="Keep Öpfelmusig running in the tray when closing the window."
      />
    </SettingsSection>
    <SettingsSection title="Sidebar">
      <SettingsToggle v-model="settingsStore.sidebarSections.pins.hidden" label="Hide pins" />
      <SettingsToggle v-model="settingsStore.sidebarSections.library.hidden" label="Hide library" />
      <SettingsToggle
        v-model="settingsStore.sidebarSections.playlists.hidden"
        label="Hide playlists"
      />
    </SettingsSection>
    <SettingsSection title="Integrations">
      <SettingsToggle
        v-model="settingsStore.player.activityReporting"
        label="Activity reporting"
        description="Report playback activity to Apple Music."
      />
      <SettingsToggle
        v-model="settingsStore.integrations.discordRichPresence"
        label="Discord Rich Presence"
      />
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
