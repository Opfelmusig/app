<template>
  <div class="flex items-center justify-between">
    <ImmersivePlayerToggle
      icon="lucide:shuffle"
      :class="queueStore.isStation ? 'pointer-events-none opacity-50' : ''"
      :active="!queueStore.isStation && queueStore.isShuffling"
      @click="queueStore.toggleShuffle"
    />

    <ImmersivePlayerButton icon="lucide:skip-back" filled @click="playbackStore.previous" />
    <ImmersivePlayerButton
      :icon="playbackStore.paused ? 'lucide:play' : 'lucide:pause'"
      :loading="playbackStore.loading"
      filled
      @click="playbackStore.toggle"
    />
    <ImmersivePlayerButton icon="lucide:skip-forward" filled @click="playbackStore.next" />

    <ImmersivePlayerToggle
      icon="lucide:repeat"
      :class="queueStore.isStation ? 'pointer-events-none opacity-50' : ''"
      :active="!queueStore.isStation && queueStore.isLooping"
      @click="queueStore.isLooping = !queueStore.isLooping"
    />
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
</script>
