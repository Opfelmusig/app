<template>
  <NuxtTime v-if="isYearOnly" :datetime="releaseDate" year="numeric" />
  <NuxtTime v-else :datetime="releaseDate" :date-style="dateStyle" />
</template>

<script lang="ts" setup>
import type { NuxtTimeProps } from "#app";

const props = withDefaults(
  defineProps<{
    releaseDate: string;
    dateStyle?: NuxtTimeProps["dateStyle"];
  }>(),
  {
    dateStyle: "medium",
  },
);

const isYearOnly = computed(() => /^\d{4}$/.test(props.releaseDate));
</script>
