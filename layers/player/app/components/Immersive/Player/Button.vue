<template>
  <div
    class="flex size-14 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
  >
    <OMIcon
      :name="loading ? 'lucide:loader-circle' : icon"
      class="size-7"
      :filled="!loading && filled"
      :class="loading ? 'animate-spin' : ''"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
  filled?: boolean;
  loading?: boolean;
}>();
</script>
