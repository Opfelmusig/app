<template>
  <component :is="is ?? 'label'" class="flex items-center justify-between gap-6">
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex flex-col">
        <span class="text-toned">{{ label }}</span>
        <span v-if="description" class="text-sm text-dimmed">{{ description }}</span>
      </div>
    </div>
    <div class="select-none">
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  description?: string;
  is?: string;
}>();
</script>
