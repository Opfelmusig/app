<template>
  <UButton
    color="neutral"
    size="lg"
    class="h-9 justify-center rounded-xl px-6 transition-transform active:scale-95"
    :disabled
  >
    <OMIcon name="lucide:play" class="size-4" filled />
    <span class="font-medium">Play</span>
  </UButton>
</template>

<script lang="ts" setup>
defineProps<{
  disabled?: boolean;
}>();
</script>
