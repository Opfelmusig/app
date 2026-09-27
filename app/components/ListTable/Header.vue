<template>
  <th class="px-2 first:pl-4 last:pr-4 last:text-right">
    <span class="font-normal">{{ text }}</span>
  </th>
</template>

<script lang="ts" setup>
defineProps<{
  text?: string;
}>();
</script>
