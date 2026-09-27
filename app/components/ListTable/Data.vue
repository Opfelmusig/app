<template>
  <td class="px-2 first:pl-4 last:pr-4 last:text-right">
    <span v-if="star" class="flex items-center gap-2">
      <span class="truncate">
        <slot />
      </span>
      <HelperFilledIcon name="lucide:star" filled class="ml-auto size-3 text-primary" />
    </span>
    <span v-else class="block truncate">
      <slot />
    </span>
  </td>
</template>

<script lang="ts" setup>
defineProps<{
  star?: boolean;
}>();
</script>
