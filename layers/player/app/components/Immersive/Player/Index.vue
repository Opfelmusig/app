<template>
  <div class="flex items-end justify-center">
    <motion.div
      class="relative shrink-0 bg-default"
      :class="{ 'cursor-pointer': !expanded }"
      :initial="false"
      :animate="target"
      :transition="transition"
      @click="expanded = true"
      @pointerdown="onPointerDown"
      @pointerup="pressed = false"
      @pointercancel="pressed = false"
      @pointerenter="hovered = true"
      @pointerleave="collapse"
    >
      <ImmersiveReverseRadius
        position="br"
        size="calc(var(--island-corner) * 1px)"
        class="pointer-events-none absolute right-full bottom-0 transition-none [&>div]:transition-none"
      />
      <div class="size-full overflow-hidden rounded-[inherit]">
        <div
          ref="content"
          class="flex flex-col gap-4 transition-[padding] duration-150 ease-out"
          :class="expanded ? 'p-4 px-6' : 'px-3 py-2'"
        >
          <ImmersivePlayerInfo :expanded />
          <div
            class="flex shrink-0 flex-col gap-4 self-center transition-opacity duration-150 ease-out"
            :class="expanded ? 'opacity-100' : 'pointer-events-none opacity-0'"
            :style="{ width: `${expandedWidth - 48}px` }"
          >
            <ImmersivePlayerProgress />
            <ImmersivePlayerControls />
          </div>
        </div>
      </div>
      <ImmersiveReverseRadius
        position="bl"
        size="calc(var(--island-corner) * 1px)"
        class="pointer-events-none absolute bottom-0 left-full transition-none [&>div]:transition-none"
      />
    </motion.div>
  </div>
</template>

<script lang="ts" setup>
import { motion, type Transition } from "motion-v";

const expanded = ref(false);
const hovered = ref(false);
const pressed = ref(false);
const content = useTemplateRef("content");
const { height: contentHeight } = useElementSize(content, undefined, { box: "border-box" });
const { width: windowWidth } = useWindowSize();

const expandedWidth = computed(() => Math.min(480, windowWidth.value - 56));
const lifted = computed(() => hovered.value && !pressed.value);
const target = computed(() => ({
  width: Math.min(expandedWidth.value, expanded.value ? 480 : lifted.value ? 276 : 260),
  height: expanded.value ? contentHeight.value : lifted.value ? 40 : 36,
  borderTopLeftRadius: expanded.value ? 32 : lifted.value ? 16 : 12,
  borderTopRightRadius: expanded.value ? 32 : lifted.value ? 16 : 12,
  "--island-corner": expanded.value ? 24 : lifted.value ? 16 : 12,
  boxShadow:
    lifted.value || expanded.value
      ? "0 -8px 32px rgba(0, 0, 0, 0.3)"
      : "0 -2px 8px rgba(0, 0, 0, 0.12)",
}));

const transition = computed<Transition>(() => {
  if (pressed.value) return { duration: 0.08, ease: "easeOut" };

  return {
    type: "spring",
    stiffness: 380,
    damping: expanded.value ? 27 : 36,
    mass: 0.8,
    boxShadow: { duration: 0.18 },
  };
});

function collapse() {
  expanded.value = false;
  hovered.value = false;
  pressed.value = false;
}

function onPointerDown(event: PointerEvent) {
  if (!expanded.value && event.button === 0) pressed.value = true;
}
</script>
