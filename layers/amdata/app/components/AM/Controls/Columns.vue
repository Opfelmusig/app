<template>
  <OMMenu icon="lucide:columns-3" :active>
    <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
      <span class="text-sm text-muted">Columns</span>
      <UCheckboxGroup v-model="model" :ui="{ fieldset: 'gap-2' }" :items />
    </div>
    <USeparator />
    <div class="flex w-48 flex-col gap-2 p-1">
      <UButton
        label="Reset columns"
        class="gap-2 rounded-b-lg"
        variant="ghost"
        color="error"
        icon="lucide:corner-up-left"
        :disabled="!active"
        :ui="{
          leadingIcon: 'size-4',
        }"
        @click="$emit('reset')"
      />
    </div>
  </OMMenu>
</template>

<script lang="ts" setup>
import type { CheckboxGroupProps } from "@nuxt/ui";

const model = defineModel<string[]>({ default: () => [] });

defineProps<{
  items: CheckboxGroupProps["items"];
  active?: boolean;
}>();

defineEmits<{
  (e: "reset"): void;
}>();
</script>
