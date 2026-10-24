<template>
  <SettingsWrapper>
    <SettingsSection title="Sidebar">
      <SettingsToggle v-model="settingsStore.sidebarSections.pins.show" label="Show pins" />
      <SettingsToggle
        v-model="settingsStore.sidebarSections.playlists.show"
        label="Show playlists"
      />
    </SettingsSection>
    <SettingsSection title="Player">
      <SettingsToggle v-model="settingsStore.player.animatedArtwork" label="Animated artwork" />
      <SettingsToggle
        v-model="settingsStore.immersive.enhanced"
        label="Enhanced immersive fullscreen"
      />
      <SettingsToggle
        v-model="settingsStore.immersive.keepExpanded"
        label="Keep immersive player expanded"
      />
      <SettingsConfig label="Miniplayer layout">
        <USelect
          v-model="settingsStore.player.miniplayerLayout"
          :items="miniplayerLayouts"
          class="w-50"
        />
      </SettingsConfig>
    </SettingsSection>
    <SettingsSection title="Lyrics">
      <SettingsToggle v-model="settingsStore.lyrics.showTranslation" label="Show translation" />
      <SettingsToggle
        v-model="settingsStore.lyrics.showTransliteration"
        label="Show transliteration"
      />
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const miniplayerLayouts = [
  { label: "Default", value: "default" },
  { label: "Artwork", value: "artwork" },
] satisfies { label: string; value: typeof settingsStore.player.miniplayerLayout }[];
</script>
