<template>
  <UTooltip arrow text="Favorited" :content="{ side: 'top' }" :delay-duration="100">
    <OMIcon
      name="lucide:star"
      filled
      class="shrink-0 text-primary"
      :class="large ? 'size-4' : 'size-3'"
    />
  </UTooltip>
</template>

<script lang="ts" setup>
defineProps<{
  large?: boolean;
}>();
</script>
