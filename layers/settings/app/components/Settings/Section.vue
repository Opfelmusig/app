<template>
  <section class="flex flex-col gap-4 border-b border-default pb-6 last:border-0 last:pb-0">
    <div v-if="title" class="flex flex-col">
      <h2 class="font-medium">{{ title }}</h2>
    </div>

    <div class="flex flex-col gap-4">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
}>();
</script>
