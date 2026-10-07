<template>
  <UBadge :label :color :variant size="sm">
    <template v-if="loading" #leading>
      <UIcon name="lucide:loader-circle" class="size-2.5 shrink-0 animate-spin" />
    </template>
  </UBadge>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";

defineProps<{
  label?: BadgeProps["label"];
  color?: BadgeProps["color"];
  variant?: BadgeProps["variant"];
  loading?: boolean;
}>();
</script>
