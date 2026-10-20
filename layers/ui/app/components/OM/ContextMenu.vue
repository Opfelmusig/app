<template>
  <UContextMenu v-if="items?.length" :items>
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
