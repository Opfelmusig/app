<template>
  <div :class="cn(overlay({ alignment }))">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  alignment?: OverlayVariants["alignment"];
}>();

const overlay = cva(
  "absolute inset-0 flex size-full bg-muted/60 text-highlighted opacity-0 select-none group-hover:opacity-100",
  {
    variants: {
      alignment: {
        center: "items-center justify-center",
        bottom: "items-end justify-between",
      },
    },
    defaultVariants: {
      alignment: "center",
    },
  },
);

type OverlayVariants = VariantProps<typeof overlay>;
</script>
