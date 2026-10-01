<script setup lang="ts">
defineProps<{
  icon: string;
  active?: boolean;
  fill?: boolean;
}>();
</script>

<template>
  <UPopover :content="{ align: 'start' }" :ui="{ content: 'overflow-hidden rounded-xl' }">
    <OMButtonSecondary :icon :active :fill />

    <template #content>
      <div class="flex w-48 flex-col">
        <slot />
      </div>
    </template>
  </UPopover>
</template>
