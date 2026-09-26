<template>
  <UButton
    color="neutral"
    variant="ghost"
    :icon
    class="size-9 shrink-0 justify-center rounded-xl transition-transform active:scale-95"
    size="lg"
    :disabled
    :ui="{
      leadingIcon: 'size-4',
    }"
  />
</template>

<script lang="ts" setup>
defineProps<{
  disabled?: boolean;
  icon?: string;
}>();
</script>
