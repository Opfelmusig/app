<template>
  <SettingsConfig :label :description>
    <USwitch v-model="model" :aria-label="label" :disabled class="shrink-0" />
  </SettingsConfig>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();

defineProps<{
  label: string;
  description?: string;
  disabled?: boolean;
}>();
</script>
