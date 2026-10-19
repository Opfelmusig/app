<template>
  <div class="relative z-110">
    <UModal
      v-model:open="settingsStore.isOpen"
      title="Settings"
      :ui="{
        content: 'h-[min(680px,85dvh)] max-w-5xl rounded-xl',
        header: 'shrink-0',
        body: 'flex min-h-0 overflow-hidden p-0 sm:p-0',
      }"
    >
      <template #body>
        <nav
          class="scrollbar-hide flex w-16 shrink-0 flex-col gap-1 overflow-y-auto border-r border-default bg-raised p-2 sm:w-52"
        >
          <div v-for="group in groups" :key="group.label" class="flex flex-col gap-1">
            <span class="mt-2 hidden px-2.5 py-2 text-xs text-dimmed sm:block">
              {{ group.label }}
            </span>
            <UButton
              v-for="item in group.pages"
              :key="item.id"
              :icon="item.icon"
              :title="item.label"
              color="neutral"
              variant="ghost"
              class="h-10 shrink-0 justify-center gap-2.5 rounded-xl px-2.5 sm:justify-start"
              :class="activePage === item.id ? 'bg-elevated text-default' : 'text-muted'"
              :ui="{ leadingIcon: 'size-4' }"
              @click="settingsStore.page = item.id"
            >
              <span class="hidden sm:inline">{{ item.label }}</span>
            </UButton>
          </div>
        </nav>
        <div :key="activePage" class="size-full min-w-0 overflow-hidden">
          <SettingsPlayback v-if="activePage === 'playback'" />
          <SettingsShortcuts v-else-if="activePage === 'shortcuts'" />
          <SettingsAccount v-else-if="activePage === 'account'" />
          <SettingsLibrary v-else-if="activePage === 'library'" />
          <SettingsApplication v-else-if="activePage === 'application'" />
          <SettingsAppearance v-else />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const groups: {
  label: string;
  pages: { id: SettingsPage; label: string; icon: string }[];
}[] = [
  {
    label: "Preferences",
    pages: [
      { id: "appearance", label: "Appearance", icon: "lucide:palette" },
      { id: "playback", label: "Playback", icon: "lucide:audio-lines" },
    ],
  },
  {
    label: "Apple Music",
    pages: [
      { id: "account", label: "Account & sharing", icon: "lucide:user" },
      { id: "library", label: "Library & data", icon: "lucide:database" },
    ],
  },
  {
    label: "Application",
    pages: [
      { id: "application", label: "App & updates", icon: "lucide:settings-2" },
      { id: "shortcuts", label: "Shortcuts", icon: "lucide:keyboard" },
    ],
  },
];

const activePage = computed(
  () =>
    groups.flatMap((group) => group.pages).find((page) => page.id === settingsStore.page)?.id ??
    "appearance",
);

onUnmounted(() => {
  settingsStore.isOpen = false;
});
</script>
