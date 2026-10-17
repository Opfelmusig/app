<template>
  <UContextMenu v-if="items?.length" :items :ui="{ content: 'w-48 rounded-xl' }">
    <slot />
  </UContextMenu>
  <slot v-else />
</template>

<script setup lang="ts">
import type { ContextMenuProps } from "@nuxt/ui";

defineProps<{
  items: ContextMenuProps["items"];
}>();
</script>
