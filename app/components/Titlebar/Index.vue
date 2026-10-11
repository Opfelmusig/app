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
        <template v-if="layout === 'default'">
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
          text="This may take a minute. You can keep browsing the catalog while your library syncs."
          arrow
        >
          <NuxtLink to="/settings/storage">
            <TitlebarBadge
              v-if="state.syncing"
              :label="`Syncing Library (${progress.songs.count} songs)`"
              class="cursor-pointer"
              color="secondary"
              variant="soft"
              loading
            />
          </NuxtLink>
        </UTooltip>
      </div>
      <div
        class="flex items-center gap-1.5"
        :class="isMacos ? '[&>button]:last:rounded-tr-[9px]' : ''"
        data-tauri-drag-region
      >
        <template v-if="layout === 'default'">
          <div class="mr-2 flex w-40 shrink-0 items-center gap-2">
            <UIcon name="lucide:volume" class="size-3.5 shrink-0" />
            <USlider
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
        </template>
        <TitlebarAction icon="lucide:terminal" small @click="openDevTools" />
        <TitlebarAction
          :icon="settingsStore.isPanelOpen ? 'lucide:panel-right-close' : 'lucide:panel-right-open'"
          small-icon
          @click="settingsStore.isPanelOpen = !settingsStore.isPanelOpen"
        />
        <USeparator v-if="!isMacos" orientation="vertical" class="h-4 shrink-0" />
      </div>
    </div>
    <TitlebarControls v-if="!isMacos" />
  </div>
</template>

<script lang="ts" setup>
import { invoke } from "@tauri-apps/api/core";

const { isCollapsed, toggle } = useSidebar();
const { canGoBack, canGoForward, goBack, goForward, reload } = useNavigation();
const { state, progress } = useLibrary();
const settingsStore = useSettingsStore();

const layout = useLayout();

async function openDevTools() {
  await invoke("native_open_devtools");
}
</script>
