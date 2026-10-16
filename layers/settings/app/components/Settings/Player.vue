<template>
  <SettingsWrapper>
    <SettingsSection title="Artwork">
      <SettingsToggle v-model="settingsStore.player.animatedArtwork" label="Animated artwork" />
    </SettingsSection>
    <SettingsSection title="Miniplayer">
      <SettingsConfig label="Layout">
        <USelect
          v-model="settingsStore.player.miniplayerLayout"
          :items="miniplayerLayouts"
          class="w-50"
        />
      </SettingsConfig>
    </SettingsSection>
    <SettingsSection title="Lyrics">
      <SettingsToggle
        v-model="settingsStore.lyrics.showTransliteration"
        label="Show transliteration"
      />
      <SettingsToggle v-model="settingsStore.lyrics.showTranslation" label="Show translation" />
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
