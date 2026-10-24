<template>
  <OMMenu icon="lucide:columns-3" :disabled>
    <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
      <span class="text-sm text-muted">Columns</span>
      <UCheckboxGroup v-model="model" :ui="{ fieldset: 'gap-2' }" :items />
    </div>
  </OMMenu>
</template>

<script lang="ts" setup>
import type { CheckboxGroupProps } from "@nuxt/ui";

const model = defineModel<string[]>({ default: () => [] });

defineProps<{
  items: CheckboxGroupProps["items"];
  disabled?: boolean;
}>();
</script>
