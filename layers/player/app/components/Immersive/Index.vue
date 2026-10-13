<template>
  <div class="fixed inset-0 z-100 flex shrink-0 flex-col bg-default select-none">
    <ImmersiveMesh />
    <ImmersiveArtwork />

    <div
      class="fixed inset-0 z-30 flex flex-col justify-between rounded-xl border-4 border-bg"
      data-tauri-drag-region
    >
      <ImmersiveHeader />
      <ImmersivePlayer />
    </div>
  </div>
</template>
