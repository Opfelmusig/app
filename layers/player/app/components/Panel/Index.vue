<template>
  <PanelWrapper>
    <div class="flex w-full items-center justify-between gap-2 p-2 text-white">
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-inverted/10 hover:backdrop-blur-md"
        @click="settingsStore.panel.isOpen = false"
      >
        <UIcon mode="svg" name="lucide:x" class="size-4" />
      </div>
      <div class="flex gap-1">
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-inverted/10 hover:backdrop-blur-md"
          :class="settingsStore.panel.page === 'queue' ? 'text-white' : 'text-muted'"
          @click="settingsStore.panel.page = 'queue'"
        >
          <UIcon mode="svg" name="lucide:list" class="size-4" />
        </div>
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-inverted/10 hover:backdrop-blur-md"
          :class="settingsStore.panel.page === 'lyrics' ? 'text-white' : 'text-muted'"
          @click="settingsStore.panel.page = 'lyrics'"
        >
          <UIcon mode="svg" name="lucide:message-square-quote" class="size-4" />
        </div>
      </div>
    </div>

    <PanelQueue />
  </PanelWrapper>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
</script>
