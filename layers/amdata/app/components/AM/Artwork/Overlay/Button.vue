<template>
  <button
    :disabled
    class="flex size-8 cursor-default items-center justify-center rounded-full bg-inverted/20 backdrop-blur-sm transition-transform hover:bg-inverted/40 active:scale-95 disabled:opacity-50"
    @click.prevent.stop="$emit('click')"
  >
    <OMIcon :name="icon" class="size-4" :filled />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
  filled?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>
