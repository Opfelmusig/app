<template>
  <div
    class="flex size-8 items-center justify-center rounded-full bg-inverted/20 backdrop-blur-sm transition-transform hover:bg-inverted/40 active:scale-95"
    @click.prevent="$emit('click')"
  >
    <OMIcon :name="icon" class="size-4" :filled />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
  filled?: boolean;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>
