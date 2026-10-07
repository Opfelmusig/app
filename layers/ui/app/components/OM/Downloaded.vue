<template>
  <UTooltip arrow text="In Library" :content="{ side: 'top' }" :delay-duration="100">
    <div
      class="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-neutral-500 text-[9px] font-bold text-inverted"
    >
      <UIcon name="lucide:arrow-down" class="size-2 [&>path]:stroke-4" mode="svg" />
    </div>
  </UTooltip>
</template>
