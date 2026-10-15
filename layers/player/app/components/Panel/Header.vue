<template>
  <div class="flex flex-col p-3 px-4">
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
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  context?: QueueContext | null;
}>();
</script>
