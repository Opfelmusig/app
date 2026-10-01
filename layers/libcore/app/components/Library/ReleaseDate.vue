<template>
  <NuxtTime v-if="isYearOnly" :datetime="releaseDate" year="numeric" />
  <NuxtTime v-else :datetime="releaseDate" date-style="medium" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  releaseDate: string;
}>();

const isYearOnly = computed(() => /^\d{4}$/.test(props.releaseDate));
</script>
