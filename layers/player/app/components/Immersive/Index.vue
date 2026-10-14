<template>
  <div
    class="fixed inset-0 z-100 flex size-full shrink-0 flex-col overflow-hidden rounded-xl border-4 border-bg bg-default select-none"
  >
    <ImmersiveHeader />

    <div class="flex min-h-0 flex-1">
      <div class="relative flex size-full flex-col justify-between">
        <ImmersiveMesh />
        <ImmersiveArtwork />

        <div class="z-30 flex h-3.5 justify-between" data-tauri-drag-region>
          <ImmersiveReverseRadius position="tl" :size="12" />
          <ImmersiveReverseRadius position="tr" :size="12" />
        </div>

        <div class="z-30 flex items-end justify-between">
          <ImmersiveReverseRadius position="bl" :size="12" />
          <ImmersivePlayer />
          <ImmersiveReverseRadius position="br" :size="12" />
        </div>
      </div>

      <ImmersiveSidebar />
    </div>
  </div>
</template>
