<template>
  <UButton
    color="neutral"
    variant="ghost"
    :icon
    :disabled
    class="size-6 justify-center rounded-sm p-0 disabled:text-dimmed/80"
    :class="active ? 'text-highlighted' : 'text-muted hover:text-default'"
    :ui="{ leadingIcon: smallIcon ? 'size-3.5' : 'size-4' }"
  />
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
  disabled?: boolean;
  active?: boolean;
  smallIcon?: boolean;
}>();
</script>
