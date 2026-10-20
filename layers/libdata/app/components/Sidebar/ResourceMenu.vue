<template>
  <OMContextMenu :items="menuItems">
    <slot />
  </OMContextMenu>
</template>

<script lang="ts" setup>
const props = defineProps<{
  resource: AmResource;
}>();

const menuItems = useResourceMenu(() => props.resource);
</script>
