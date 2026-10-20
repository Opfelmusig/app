<template>
  <button
    :disabled="loading"
    class="flex size-8 cursor-default items-center justify-center rounded-full bg-inverted/20 backdrop-blur-sm transition-transform hover:bg-inverted/40 active:scale-95"
    @click.stop="click"
  >
    <OMIcon
      :name="loading ? 'lucide:loader-circle' : icon"
      class="size-4"
      :class="loading ? 'animate-spin stroke-3 [&>path]:stroke-3' : ''"
      :filled="!loading && filled"
    />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  icon: string;
  filled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function click(event: MouseEvent) {
  if (props.loading) return;
  emit("click", event);
  event.preventDefault();
}
</script>
