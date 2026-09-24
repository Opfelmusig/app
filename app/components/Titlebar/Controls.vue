<template>
  <div class="flex">
    <UButton
      v-for="action in windowActions"
      :key="action.id"
      :icon="action.icon"
      color="neutral"
      variant="ghost"
      class="h-full w-12 justify-center rounded-none p-0 text-muted hover:text-highlighted"
      :class="action.id === 'close' ? 'hover:bg-error/80' : 'hover:bg-muted'"
      :ui="{ leadingIcon: 'size-4' }"
      @click="action.onClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
const maximized = ref(false);
const windowActions = computed(() => [
  {
    id: "minimize",
    label: "Minimize",
    icon: "lucide:minus",
    onClick: () => appWindow.minimize(),
  },
  {
    id: "maximize",
    label: maximized.value ? "Restore" : "Maximize",
    icon: maximized.value ? "lucide:minimize" : "lucide:maximize",
    onClick: () => appWindow.toggleMaximize(),
  },
  { id: "close", label: "Close", icon: "lucide:x", onClick: () => appWindow.close() },
]);

const syncMaximized = async () => {
  maximized.value = await appWindow.isMaximized();
};

const unlistenResize = await appWindow.onResized(syncMaximized);
await syncMaximized();

onUnmounted(unlistenResize);
</script>
