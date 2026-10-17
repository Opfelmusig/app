<template>
  <div
    :class="
      cn('flex w-full min-w-0 items-center gap-4 text-xs text-muted tabular-nums', props.class)
    "
  >
    <span class="pointer-events-none shrink-0">{{
      msToHMS((seekPosition ?? position) * 1000)
    }}</span>
    <USlider
      :model-value="seekPosition ?? position"
      :min="0"
      :max="duration || 1"
      :step="0.1"
      :disabled="disabled || !duration"
      :size
      class="min-w-0 flex-1"
      :class="size === 'xs' ? 'py-1' : 'py-2'"
      @update:model-value="seekPosition = $event ?? null"
      @change="commitSeek"
      @pointercancel="seekPosition = null"
      @keydown.capture.stop
    />
    <span class="pointer-events-none shrink-0">{{ msToHMS(duration * 1000) }}</span>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    position: number;
    duration: number;
    disabled?: boolean;
    size?: "xs" | "md" | "lg";
    class?: string;
  }>(),
  { size: "md", class: "" },
);

const emit = defineEmits<{ seek: [position: number] }>();
const seekPosition = ref<number | null>(null);

function commitSeek() {
  if (seekPosition.value !== null) emit("seek", seekPosition.value);
  seekPosition.value = null;
}
</script>
