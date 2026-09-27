<template>
  <UIcon
    :name
    mode="svg"
    :class="cn(filled && '[&>g]:fill-current [&>path]:fill-current', props.class)"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string;
  class?: string;
  filled?: boolean;
}>();
</script>
