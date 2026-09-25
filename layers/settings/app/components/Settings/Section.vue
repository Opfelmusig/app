<template>
  <section class="flex flex-col gap-4">
    <slot />
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
