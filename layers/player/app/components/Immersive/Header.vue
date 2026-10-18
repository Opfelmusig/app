<template>
  <div
    class="flex h-9 w-full items-center justify-end gap-1.5 overflow-hidden bg-default p-1.5 text-muted shadow-2xl"
    data-tauri-drag-region
  >
    <div class="mr-2 flex w-40 shrink-0 items-center gap-2" data-tauri-drag-region>
      <UIcon name="lucide:volume" class="size-3.5 shrink-0" />
      <USlider
        v-model="volumeStore.volume"
        :min="0"
        :max="1"
        :step="0.01"
        class="py-2"
        size="xs"
        :ui="{
          range: 'bg-white transition-colors',
        }"
      />
      <UIcon name="lucide:volume-2" class="ml-1 size-3.5 shrink-0" />
    </div>
    <USeparator orientation="vertical" class="h-4 shrink-0" />
    <div
      class="flex gap-1.5"
      :class="isMacos ? '[&>button]:last:rounded-tr-[9px]' : ''"
      data-tauri-drag-region
    >
      <ImmersiveButton
        :active="settingsStore.immersive.lyrics"
        icon="lucide:message-square-quote"
        small-icon
        @click="settingsStore.immersive.lyrics = !settingsStore.immersive.lyrics"
      />
      <ImmersiveButton
        :active="settingsStore.immersive.queue"
        icon="lucide:list"
        @click="settingsStore.immersive.queue = !settingsStore.immersive.queue"
      />
      <ImmersiveButton
        icon="lucide:settings"
        :active="settingsStore.isOpen"
        small-icon
        @click="settingsStore.isOpen = true"
      />
      <ImmersiveButton icon="lucide:x" @click="settingsStore.immersive.isOpen = false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
const volumeStore = useVolumeStore();
</script>
