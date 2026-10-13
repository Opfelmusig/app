<template>
  <div class="pointer-events-none fixed inset-1 top-9 z-10 overflow-hidden rounded-xl">
    <Transition>
      <div
        v-if="settingsStore.immersive.isOpen"
        class="pointer-none relative isolate size-full overflow-hidden bg-default duration-500"
      >
        <div class="mesh-base" :class="baseClasses" />
        <div class="mesh-layer-1" :class="layerClass" />
        <div class="mesh-layer-2" :class="layerClass" />
        <div class="mesh-layer-3" :class="layerClass" />
        <div class="mesh-layer-4" :class="layerClass" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();

const baseClasses = cn("absolute -inset-20 opacity-50 blur-[72px] saturate-120");

const layerClass = cn(baseClasses, "will-change-transform");
</script>

<style scoped>
.mesh-base {
  background:
    radial-gradient(circle at 18% 20%, var(--dark-muted) 0%, transparent 42%),
    radial-gradient(circle at 82% 24%, var(--dark-vibrant) 0%, transparent 40%),
    radial-gradient(circle at 50% 78%, var(--muted) 0%, transparent 46%);
}

.mesh-layer-1 {
  background:
    radial-gradient(circle at 20% 22%, var(--vibrant) 0%, transparent 36%),
    radial-gradient(circle at 70% 65%, var(--light-vibrant) 0%, transparent 34%);
  animation: mesh-drift-a 3s ease-in-out infinite alternate;
}

.mesh-layer-2 {
  background:
    radial-gradient(circle at 78% 24%, var(--light-muted) 0%, transparent 34%),
    radial-gradient(circle at 30% 74%, var(--muted) 0%, transparent 40%);
  animation: mesh-drift-b 2s ease-in-out infinite alternate;
}

.mesh-layer-3 {
  background:
    radial-gradient(circle at 48% 18%, var(--light-vibrant) 0%, transparent 30%),
    radial-gradient(circle at 62% 82%, var(--dark-vibrant) 0%, transparent 38%);
  animation: mesh-drift-c 4s ease-in-out infinite alternate;
}

.mesh-layer-4 {
  background:
    radial-gradient(circle at 14% 66%, var(--vibrant) 0%, transparent 34%),
    radial-gradient(circle at 88% 74%, var(--dark-muted) 0%, transparent 36%);
  animation: mesh-drift-b 5s ease-in-out infinite alternate-reverse;
}

@keyframes mesh-drift-a {
  0% {
    transform: translate3d(0%, 0%, 0) scale(1.08);
  }
  100% {
    transform: translate3d(7%, -12%, 0) scale(1.21);
  }
}

@keyframes mesh-drift-b {
  0% {
    transform: translate3d(0%, 0%, 0) scale(1.1);
  }
  100% {
    transform: translate3d(-8%, 6%, 0) scale(1.33);
  }
}

@keyframes mesh-drift-c {
  0% {
    transform: translate3d(0%, 0%, 0) scale(1.06);
  }
  100% {
    transform: translate3d(3%, 11%, 0) scale(1.45);
  }
}
</style>
