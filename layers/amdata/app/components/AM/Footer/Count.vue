<template>
  <span v-if="singular"> {{ count }} {{ count === 1 ? singular : pluralText }} </span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  count?: number;
  singular?: string;
  plural?: string;
}>();

const pluralText = computed(() => props.plural ?? `${props.singular}s`);
</script>
