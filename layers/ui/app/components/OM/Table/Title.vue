<template>
  <div class="flex items-center justify-between p-3 pl-4">
    <div class="flex flex-col">
      <div class="text-lg">{{ title }}</div>
      <span v-if="context && name" class="text-xs text-muted">
        Playing
        <NuxtLink v-if="link" :to="link" class="hover:underline">{{ name }}</NuxtLink>
        <span v-else>{{ name }}</span>
      </span>
    </div>
    <UButton
      v-if="clearable"
      label="Clear"
      variant="ghost"
      color="neutral"
      class="text-muted hover:text-default"
      @click="$emit('clear')"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string;
  context?: QueueContext | null;
  clearable?: boolean;
}>();

defineEmits<{
  (e: "clear"): void;
}>();

const link = computed(() =>
  props.context?.type === "generic" ? props.context.link : resourceLink(props.context),
);

const name = computed(() =>
  props.context?.type === "generic" ? props.context.name : props.context?.attributes.name,
);
</script>
