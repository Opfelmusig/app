<template>
  <slot v-if="resources && resources?.length > 0" />
  <div v-if="isPending" :class="cn(statusClass())">
    <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
    <span>Loading</span>
  </div>
  <div v-else-if="error" :class="cn(statusClass({ color: 'error' }))">
    <UIcon name="lucide:x" class="size-4" />
    <span>{{ error.message }}</span>
  </div>
  <div v-else-if="total === 0 && resources?.length === 0" :class="cn(statusClass())">
    This list is empty
  </div>
  <div v-else-if="resources === undefined || resources?.length === 0" :class="cn(statusClass())">
    No resources found
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  isPending: boolean;
  error: Error | null;
  total?: number;
  resources?: unknown[];
}>();

const statusClass = cva(
  "order-last col-span-full flex size-full h-14 items-center justify-center gap-2 px-4 text-sm whitespace-nowrap",
  {
    variants: {
      color: {
        muted: "text-muted",
        error: "text-error",
      },
    },
    defaultVariants: {
      color: "muted",
    },
  },
);
</script>
