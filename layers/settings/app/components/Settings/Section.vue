<template>
  <section class="flex flex-col gap-4 border-b border-default pb-8 last:border-b-0 last:pb-0">
    <div v-if="title" class="flex flex-col">
      <h1>{{ title }}</h1>
      <p v-if="description" class="text-sm text-muted">{{ description }}</p>
    </div>

    <div class="flex flex-col gap-4">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
