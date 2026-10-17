<template>
  <div :class="cn('flex shrink-0 items-center gap-1 text-muted', props.class)">
    <button type="button" :class="buttonClass" :disabled @click="emit('previous')">
      <OMIcon name="lucide:skip-back" :class="iconClass" filled />
    </button>
    <button
      type="button"
      :class="buttonClass"
      :disabled="disabled || loading"
      @click="emit('toggle')"
    >
      <OMIcon
        :name="loading ? 'lucide:loader-circle' : paused ? 'lucide:play' : 'lucide:pause'"
        :class="cn(iconClass, loading && 'animate-spin')"
        :filled="!loading"
      />
    </button>
    <button type="button" :class="buttonClass" :disabled @click="emit('next')">
      <OMIcon name="lucide:skip-forward" :class="iconClass" filled />
    </button>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    paused: boolean;
    loading?: boolean;
    disabled?: boolean;
    size?: "xs" | "sm" | "md";
    class?: string;
  }>(),
  { size: "md", class: "" },
);

const emit = defineEmits<{
  previous: [];
  toggle: [];
  next: [];
}>();

const buttonClass = computed(() =>
  cn(
    "flex shrink-0 items-center justify-center transition-transform hover:bg-inverted/10 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
    { xs: "size-5 rounded-md", sm: "size-8 rounded-lg", md: "size-10 rounded-xl" }[props.size],
  ),
);
const iconClass = computed(() => ({ xs: "size-3.5", sm: "size-5", md: "size-4" })[props.size]);
</script>
