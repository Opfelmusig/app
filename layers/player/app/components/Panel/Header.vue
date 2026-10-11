<template>
  <div class="flex flex-col p-2 px-3">
    <div class="text-default">{{ title }}</div>
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
import type { QueueContext } from "#layers/player/app/types/queue";

defineProps<{
  title: string;
  context?: QueueContext | null;
}>();
</script>
