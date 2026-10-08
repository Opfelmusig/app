<template>
  <AMControlsFiltersSection :label>
    <UCheckboxGroup v-model="model" :ui="{ fieldset: 'gap-2' }" :items />
  </AMControlsFiltersSection>
</template>

<script lang="ts" setup>
import type { CheckboxGroupProps } from "@nuxt/ui";

const model = defineModel<(string | number)[]>({ default: () => [] });

defineProps<{
  label: string;
  items: CheckboxGroupProps["items"];
}>();
</script>
