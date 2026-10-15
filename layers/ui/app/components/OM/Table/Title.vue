<template>
  <div class="flex items-center justify-between p-3 pl-4">
    <div class="flex flex-col">
      <div class="text-lg">{{ title }}</div>
      <span v-if="context" class="text-xs text-muted">
        <span v-if="typeof context === 'string'">
          {{ context }}
        </span>
        <NuxtLink v-else :to="resourceLink(context)" class="hover:underline">
          {{ context.attributes.name }}
        </NuxtLink>
      </span>
    </div>
    <UButton
      v-if="clearable"
      label="Clear"
      variant="ghost"
      color="neutral"
      class="text-muted hover:text-default"
      @click="$emit('clear')"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  context?: QueueContext | null;
  clearable?: boolean;
}>();

defineEmits<{
  (e: "clear"): void;
}>();
</script>
