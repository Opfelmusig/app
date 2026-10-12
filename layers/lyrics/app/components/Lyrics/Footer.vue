<template>
  <span v-if="songwriters.length" class="text-lg text-highlighted/60">
    <span>Written By: </span>
    <span class="font-normal text-highlighted/40">{{ songwriters.join(", ") }}</span>
  </span>
</template>

<script lang="ts" setup>
defineProps<{
  songwriters: string[];
}>();
</script>
