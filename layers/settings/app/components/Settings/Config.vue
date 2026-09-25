<template>
  <div class="flex w-full flex-col gap-2">
    <component :is="noLabel ? 'div' : 'label'" class="flex items-center justify-between gap-6">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex flex-col">
          <span>{{ label }}</span>
          <span v-if="description" class="text-sm text-dimmed">{{ description }}</span>
        </div>
      </div>
      <div class="select-none">
        <slot />
      </div>
    </component>
    <span v-if="error" class="text-sm text-error">{{ error.name }}: {{ error.message }}</span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  description?: string;
  noLabel?: boolean;
  error?: Error | null;
}>();
</script>
