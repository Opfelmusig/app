<template>
  <div
    class="flex h-full flex-col overflow-hidden bg-default transition-[width]"
    :class="settingsStore.immersive.queue ? 'w-120' : 'w-0'"
  >
    <PanelQueue />
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
