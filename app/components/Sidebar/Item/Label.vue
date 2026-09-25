<template>
  <div v-if="!isCollapsed" class="flex w-full min-w-0 items-center gap-1">
    <span class="w-full truncate text-sm">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
const { isCollapsed } = useSidebar();
</script>
