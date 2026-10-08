<template>
  <tr
    class="group last:[&>td]:border-b-0"
    :class="
      noHover ? 'h-10' : 'h-14 hover:bg-raised [&:active:not(:has(.no-active:active))]:bg-muted/60'
    "
  >
    <slot />
  </tr>
</template>

<script lang="ts" setup>
defineProps<{
  noHover?: boolean;
}>();
</script>
