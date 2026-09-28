<template>
  <th
    class="sticky top-0 z-10 border-b border-default bg-raised px-2 first:pl-4 last:pr-4 last:text-right"
  >
    <span class="font-normal text-dimmed">{{ text }}</span>
  </th>
</template>

<script lang="ts" setup>
defineProps<{
  text?: string;
}>();
</script>
