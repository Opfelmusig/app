<template>
  <div class="flex w-full flex-col" data-tauri-drag-region>
    <div
      class="flex h-8 w-full items-end overflow-hidden bg-default px-0.5 text-muted shadow-2xl"
      data-tauri-drag-region
    >
      <div
        class="flex h-8 w-full shrink-0 items-center justify-end gap-1.5 pb-1"
        data-tauri-drag-region
      >
        <div class="mr-2 flex w-40 shrink-0 items-center gap-2" data-tauri-drag-region>
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
        <div
          class="flex gap-1.5"
          :class="isMacos ? '[&>button]:last:rounded-tr-[9px]' : ''"
          data-tauri-drag-region
        >
          <ImmersiveButton icon="lucide:list" @click="togglePage('queue')" />
          <ImmersiveButton
            icon="lucide:message-square-quote"
            small-icon
            @click="togglePage('lyrics')"
          />
          <ImmersiveButton
            icon="lucide:settings"
            aria-label="Open settings"
            :active="settingsStore.isOpen"
            small-icon
            @click="settingsStore.isOpen = true"
          />
          <ImmersiveButton icon="lucide:x" @click="settingsStore.immersive.isOpen = false" />
        </div>
      </div>
    </div>
    <div class="z-10 flex h-3.5 justify-between" data-tauri-drag-region>
      <ImmersiveReverseRadius position="tl" :size="14" />
      <ImmersiveReverseRadius position="tr" :size="14" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
const volumeStore = useVolumeStore();

function togglePage(page: "queue" | "lyrics") {
  const immersive = settingsStore.immersive;
  immersive.isOpen = !immersive.isOpen || immersive.page !== page;
  immersive.page = page;
}
</script>
