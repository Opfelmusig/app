<template>
  <UContextMenu :items :ui="{ content: 'w-48 rounded-xl' }">
    <slot />
  </UContextMenu>
</template>

<script setup lang="ts">
import type { ContextMenuProps } from "@nuxt/ui";

defineProps<{
  items: ContextMenuProps["items"];
}>();
</script>
