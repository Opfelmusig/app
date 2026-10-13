<template>
  <section class="flex flex-col gap-4">
    <div v-if="title" class="flex flex-col">
      <h2>{{ title }}</h2>
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
