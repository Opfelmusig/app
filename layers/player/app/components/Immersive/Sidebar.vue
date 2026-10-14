<template>
  <div
    class="flex h-full shrink-0 flex-col overflow-hidden bg-default transition-[width]"
    :class="settingsStore.immersive.queue ? 'w-100' : 'w-0'"
  >
    <div class="flex h-full w-100 flex-col overflow-hidden">
      <Queue />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
