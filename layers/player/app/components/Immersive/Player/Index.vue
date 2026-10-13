<template>
  <div class="flex items-end justify-center">
    <ImmersiveReverseRadius position="br" :size="24" class="z-10" />
    <div class="flex w-120 flex-col gap-4 rounded-t-4xl bg-default p-4 px-6 shadow-2xl">
      <ImmersivePlayerInfo />
      <ImmersivePlayerProgress />
      <ImmersivePlayerControls />
    </div>
    <ImmersiveReverseRadius position="bl" :size="24" class="z-10" />
  </div>
</template>
