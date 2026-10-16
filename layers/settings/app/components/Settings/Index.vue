<template>
  <div class="relative z-110">
    <UModal
      v-model:open="settingsStore.isOpen"
      title="Settings"
      :portal="false"
      :ui="{
        content: 'h-[min(650px,85dvh)] max-w-4xl rounded-xl',
        header: 'shrink-0',
        body: 'flex min-h-0 overflow-hidden p-0 sm:p-0',
      }"
    >
      <template #body>
        <nav
          class="scrollbar-hide flex w-16 shrink-0 flex-col gap-1 overflow-y-auto border-r border-default bg-raised p-2 sm:w-52"
        >
          <template v-for="item in pages" :key="item.id">
            <span
              v-if="'group' in item"
              class="mt-2 hidden px-2.5 py-2 text-xs text-dimmed sm:block"
            >
              {{ item.group }}
            </span>
            <UButton
              :icon="item.icon"
              :title="item.label"
              color="neutral"
              variant="ghost"
              class="h-10 shrink-0 justify-center gap-2.5 rounded-xl px-2.5 sm:justify-start"
              :class="settingsStore.page === item.id ? 'bg-elevated text-default' : 'text-muted'"
              :ui="{ leadingIcon: 'size-4' }"
              @click="settingsStore.page = item.id"
            >
              <span class="hidden sm:inline">{{ item.label }}</span>
            </UButton>
          </template>
        </nav>
        <div :key="settingsStore.page" class="size-full min-w-0 overflow-hidden">
          <SettingsAccount v-if="settingsStore.page === 'account'" />
          <SettingsPlayback v-else-if="settingsStore.page === 'playback'" />
          <SettingsMiniplayer v-else-if="settingsStore.page === 'miniplayer'" />
          <SettingsAbout v-else-if="settingsStore.page === 'about'" />
          <SettingsStorage v-else-if="settingsStore.page === 'storage'" />
          <SettingsShortcuts v-else-if="settingsStore.page === 'shortcuts'" />
          <SettingsGeneral v-else />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const pages: { id: SettingsPage; label: string; icon: string; group?: string }[] = [
  { id: "general", label: "General", icon: "lucide:settings-2" },
  { id: "account", label: "Account", icon: "lucide:user" },
  { id: "playback", label: "Playback", icon: "lucide:music", group: "Music" },
  { id: "miniplayer", label: "Miniplayer", icon: "lucide:picture-in-picture-2" },
  {
    id: "about",
    label: "Updates & about",
    icon: "lucide:info",
    group: "Help & data",
  },
  {
    id: "storage",
    label: "Storage & library",
    icon: "lucide:database",
  },
  { id: "shortcuts", label: "Shortcuts", icon: "lucide:keyboard" },
];

onUnmounted(() => {
  settingsStore.isOpen = false;
});
</script>
