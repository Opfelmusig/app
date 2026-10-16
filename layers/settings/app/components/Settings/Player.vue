<template>
  <SettingsWrapper>
    <SettingsSection title="Artwork">
      <SettingsToggle v-model="settingsStore.player.animatedArtwork" label="Animated artwork" />
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
</script>
