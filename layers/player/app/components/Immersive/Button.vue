<template>
  <UButton
    color="neutral"
    variant="ghost"
    :icon
    :disabled
    class="size-6 justify-center rounded-md p-0 hover:bg-inverted/10 active:bg-inverted/20 disabled:text-dimmed/80"
    :class="active ? 'text-highlighted' : 'text-highlighted/40'"
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
