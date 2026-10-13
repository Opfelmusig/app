<template>
  <div
    class="flex items-start justify-start overflow-hidden transition-[width,height]"
    :style="{
      width: px,
      height: px,
    }"
  >
    <div
      class="size-full shrink-0 outline-16 outline-neutral-900 transition-[border-radius]"
      :style="style"
    />
  </div>
</template>

<script lang="ts" setup>
import type { StyleValue } from "vue";

const props = defineProps<{
  size: number | string;
  position: "tl" | "tr" | "bl" | "br";
}>();

const px = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const style = computed<StyleValue>(() => {
  const style: StyleValue = {};

  switch (props.position) {
    case "tl":
      style.borderTopLeftRadius = px.value;
      break;
    case "tr":
      style.borderTopRightRadius = px.value;
      break;
    case "bl":
      style.borderBottomLeftRadius = px.value;
      break;
    case "br":
      style.borderBottomRightRadius = px.value;
      break;
  }

  return style;
});
</script>
