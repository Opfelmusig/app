<template>
  <SettingsConfig :label :description>
    <USwitch v-model="model" :disabled class="shrink-0" />
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
