<template>
  <div
    class="z-30 flex h-full shrink-0 overflow-hidden transition-[width]"
    :class="settingsStore.immersive.queue ? 'w-104' : 'w-0'"
  >
    <ImmersiveReverseRadius position="tr" :size="settingsStore.immersive.queue ? 16 : 0" />
    <div class="flex h-full w-100 shrink-0 flex-col overflow-hidden bg-default">
      <Queue />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
