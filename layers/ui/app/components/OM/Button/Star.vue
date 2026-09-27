<template>
  <UButton
    :color="starred ? 'primary' : 'neutral'"
    variant="soft"
    class="size-9 shrink-0 justify-center rounded-xl transition-transform active:scale-95"
    size="lg"
    :disabled
  >
    <OMIcon name="lucide:star" class="size-4 shrink-0" :filled="starred" />
  </UButton>
</template>

<script lang="ts" setup>
defineProps<{
  disabled?: boolean;
  starred?: boolean;
  icon?: string;
}>();
</script>
