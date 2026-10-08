<template>
  <OMMenu icon="lucide:arrow-up-down" :active>
    <div class="flex gap-1 p-1">
      <UButton
        v-for="direction in directions"
        :key="direction"
        :variant="directionModel === direction ? 'soft' : 'ghost'"
        :leading-icon="direction === 'asc' ? 'lucide:chevron-down' : 'lucide:chevron-up'"
        class="w-full justify-center rounded-sm first:rounded-tl-lg last:rounded-tr-lg"
        color="neutral"
        :ui="{ leadingIcon: 'size-4' }"
        @click="directionModel = direction"
      />
    </div>
    <USeparator />
    <div class="flex w-48 flex-col gap-2 p-2 px-2.5">
      <URadioGroup v-model="model" :ui="{ fieldset: 'gap-2' }" :items aria-label="Sort songs by" />
    </div>
    <USeparator />
    <div class="flex w-48 flex-col gap-2 p-1">
      <UButton
        label="Reset sorting"
        class="gap-2 rounded-b-lg"
        variant="ghost"
        color="error"
        icon="lucide:corner-up-left"
        :disabled="!active"
        :ui="{ leadingIcon: 'size-4' }"
        @click="$emit('reset')"
      />
    </div>
  </OMMenu>
</template>

<script lang="ts" setup>
import type { RadioGroupProps } from "@nuxt/ui";

import type { SortingDirection } from "#layers/amdata/app/types/sorting";

const directions = ["asc", "desc"] as const;

const model = defineModel<string>({ required: true });
const directionModel = defineModel<SortingDirection>("direction", {
  default: () => "asc",
});

defineProps<{
  items: RadioGroupProps["items"];
  active?: boolean;
}>();

defineEmits<{
  (e: "reset"): void;
}>();
</script>
