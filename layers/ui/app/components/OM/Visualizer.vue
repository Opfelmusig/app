<template>
  <div class="flex h-3 w-4 items-center gap-px">
    <div
      v-for="i in 4"
      :key="i"
      :class="cn(`bar-${i} w-0.75 rounded-full bg-inverted`)"
      :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }"
    />
  </div>
</template>

<script lang="ts" setup>
const { isPlaying } = usePlaybackStore();
</script>

<style>
@keyframes visualizer-bar {
  from {
    height: 0.25rem;
  }

  to {
    height: 100%;
  }
}

.bar-1 {
  animation: visualizer-bar 750ms ease-in-out 0ms infinite alternate;
}

.bar-2 {
  animation: visualizer-bar 300ms ease-in-out 0ms infinite alternate;
}

.bar-3 {
  animation: visualizer-bar 600ms ease-in-out 0ms infinite alternate;
}

.bar-4 {
  animation: visualizer-bar 500ms ease-in-out 0ms infinite alternate;
}
</style>
