<template>
  <UTooltip :text="tooltip" arrow>
    <UBadge :label :color :variant size="sm" />
  </UTooltip>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";

defineProps<{
  label?: BadgeProps["label"];
  color?: BadgeProps["color"];
  variant?: BadgeProps["variant"];
  tooltip?: string;
}>();
</script>
