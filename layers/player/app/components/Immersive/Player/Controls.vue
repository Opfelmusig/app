<template>
  <div class="flex items-center justify-between">
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
      :class="queueStore.isShuffling ? 'bg-white/20' : 'hover:bg-muted'"
      @click="queueStore.toggleShuffle"
    >
      <UIcon
        name="lucide:shuffle"
        class="size-5"
        :class="queueStore.isShuffling ? 'text-white' : 'text-muted'"
      />
    </div>
    <ImmersivePlayerButton icon="lucide:skip-back" filled @click="playbackStore.previous" />
    <ImmersivePlayerButton
      :icon="playbackStore.paused ? 'lucide:play' : 'lucide:pause'"
      :loading="playbackStore.pending"
      filled
      @click="playbackStore.toggle"
    />
    <ImmersivePlayerButton icon="lucide:skip-forward" filled @click="queueStore.next" />
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
      :class="queueStore.isLooping ? 'bg-white/20' : 'hover:bg-muted'"
      @click="queueStore.isLooping = !queueStore.isLooping"
    >
      <UIcon
        name="lucide:repeat"
        class="size-5"
        :class="queueStore.isLooping ? 'text-white' : 'text-muted'"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
</script>
