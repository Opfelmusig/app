<template>
  <SettingsWrapper>
    <SettingsSection>
      <div class="flex items-center gap-3">
        <AMArtworkWrapper :resource="profile" context="account">
          <AMArtworkImage />
          <AMArtworkPlaceholder />
        </AMArtworkWrapper>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 truncate font-medium">
            <span>
              {{ profile?.attributes?.name ?? "You" }}
            </span>
            <span
              v-if="storefront?.attributes?.name"
              class="rounded-sm bg-muted px-1.5 py-0.5 text-xs"
            >
              {{ storefront.attributes.name }}
            </span>
          </div>
          <div class="min-w-0 text-sm text-muted">
            <span v-if="profile?.attributes?.handle" class="truncate">
              @{{ profile.attributes.handle }}
            </span>
            <span v-else class="truncate">Connected</span>
          </div>
        </div>

        <UButton
          icon="lucide:log-out"
          label="Log out"
          color="error"
          variant="soft"
          class="shrink-0"
          @click="logout"
        />
      </div>
      <SettingsConfig
        v-if="storefront?.attributes"
        no-label
        label="Apple Music language"
        description="This affects only Apple Music data."
      >
        <USelect v-model="settingsStore.language" :items="options" class="w-50" />
      </SettingsConfig>
    </SettingsSection>
    <SettingsSection title="Listening activity">
      <SettingsToggle
        v-model="settingsStore.player.activityReporting"
        label="Report activity to Apple Music"
        description="Send your playback activity to Apple Music."
      />
      <SettingsToggle
        v-model="settingsStore.integrations.discordRichPresence"
        label="Share listening activity on Discord"
        description="Show what you are listening to with Discord Rich Presence."
      />
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const { profile, storefront, logout } = useAuth();
const settingsStore = useSettingsStore();

const names = new Intl.DisplayNames("en", {
  type: "language",
  languageDisplay: "standard",
});

const options = storefront.value?.attributes?.supportedLanguageTags.map((tag) => ({
  value: tag,
  label: names.of(tag) ?? tag,
}));
</script>
