<template>
  <UDropdownMenu
    :items
    :content="{ side: 'bottom', align: 'end' }"
    :ui="{ content: 'w-48 rounded-xl' }"
  >
    <slot>
      <OMButtonTertiary
        icon="lucide:ellipsis"
        aria-label="More actions"
        class="no-active text-muted"
        @click.stop
        @dblclick.stop
      />
    </slot>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuProps } from "@nuxt/ui";

defineProps<{
  items: DropdownMenuProps["items"];
}>();
</script>
