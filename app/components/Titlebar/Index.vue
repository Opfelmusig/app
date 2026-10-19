<template>
  <div
    class="flex h-9.25 w-full shrink-0 justify-between border-b border-default text-muted select-none"
    data-tauri-drag-region
  >
    <div
      class="flex size-full justify-between gap-1.5 p-1.5"
      :class="isMacos ? 'ml-19' : ''"
      data-tauri-drag-region
    >
      <div class="flex items-center gap-1.5" data-tauri-drag-region>
        <template v-if="isDefaultLayout">
          <TitlebarAction
            :icon="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
            small-icon
            @click="toggle"
          />
          <TitlebarAction icon="lucide:chevron-left" :disabled="!canGoBack" @click="goBack" />
          <TitlebarAction
            icon="lucide:chevron-right"
            :disabled="!canGoForward"
            @click="goForward"
          />
        </template>
        <TitlebarAction icon="lucide:rotate-ccw" small-icon @click="reload" />
        <TitlebarBadge v-if="isDev" label="DEV" color="error" variant="soft" />
        <UTooltip
          v-if="isDefaultLayout"
          text="This may take a minute. You can keep browsing the catalog while your library syncs."
          arrow
        >
          <button v-if="state.syncing" type="button" @click="openLibrarySettings">
            <TitlebarBadge
              label="Syncing library"
              class="cursor-pointer"
              color="secondary"
              variant="soft"
              loading
            />
          </button>
        </UTooltip>
      </div>
      <div
        v-if="isDefaultLayout"
        class="flex items-center gap-1.5"
        :class="isMacos ? '[&>button]:last:rounded-tr-[9px]' : ''"
        data-tauri-drag-region
      >
        <div class="mr-2 flex w-40 shrink-0 items-center gap-2">
          <UIcon name="lucide:volume" class="size-3.5 shrink-0" />
          <USlider
            v-model="volumeStore.volume"
            :min="0"
            :max="1"
            :step="0.01"
            class="py-3"
            size="sm"
            :ui="{
              range: 'bg-white transition-colors',
            }"
          />
          <UIcon name="lucide:volume-2" class="ml-1 size-3.5 shrink-0" />
        </div>
        <USeparator orientation="vertical" class="h-4 shrink-0" />
        <TitlebarAction
          v-if="isDefaultLayout"
          icon="lucide:command"
          :active="settingsStore.commandPaletteOpen"
          small-icon
          @click="settingsStore.commandPaletteOpen = !settingsStore.commandPaletteOpen"
        />
        <TitlebarAction
          v-if="isDefaultLayout"
          icon="lucide:settings"
          :active="settingsStore.isOpen"
          small-icon
          @click="settingsStore.isOpen = true"
        />
        <TitlebarAction
          :icon="
            settingsStore.panel.isOpen ? 'lucide:panel-right-close' : 'lucide:panel-right-open'
          "
          small-icon
          :active="settingsStore.panel.isOpen"
          @click="settingsStore.panel.isOpen = !settingsStore.panel.isOpen"
        />
        <USeparator
          v-if="!isMacos && !settingsStore.system.hideTitlebarControls"
          orientation="vertical"
          class="h-4 shrink-0"
        />
      </div>
    </div>
    <TitlebarControls v-if="!isMacos && !settingsStore.system.hideTitlebarControls" />
  </div>
</template>

<script lang="ts" setup>
const { isCollapsed, toggle } = useSidebar();
const { canGoBack, canGoForward, goBack, goForward, reload } = useNavigation();
const { state } = useLibrary();
const layout = useLayout();

const settingsStore = useSettingsStore();
const volumeStore = useVolumeStore();

function openLibrarySettings() {
  settingsStore.page = "library";
  settingsStore.isOpen = true;
}

const isDefaultLayout = computed(() => layout.value === "default");
</script>
