<template>
  <OMMenu icon="lucide:filter" :active :disabled fill>
    <slot />
    <USeparator />
    <div class="flex w-48 flex-col gap-2 p-1">
      <UButton
        label="Reset filters"
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
defineProps<{
  active?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "reset"): void;
}>();
</script>
