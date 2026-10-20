<template>
  <UDropdownMenu :items :disabled :content="{ side: 'bottom', align: 'end' }">
    <slot>
      <OMButtonTertiary
        icon="lucide:ellipsis"
        :disabled
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
  disabled?: boolean;
}>();
</script>
