<template>
  <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
    <span class="text-sm text-muted">{{ label }}</span>
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
}>();
</script>
