<template>
  <div
    class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95"
    :class="active ? 'bg-white/10' : 'hover:bg-muted'"
  >
    <UIcon :name="icon" class="size-5" :class="active ? 'text-white' : 'text-muted'" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
  active?: boolean;
}>();
</script>
