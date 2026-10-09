<template>
  <div :class="cn(overlay({ alignment, transparent }))">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  alignment?: OverlayVariants["alignment"];
  transparent?: boolean;
}>();

const overlay = cva(
  "no-action absolute inset-0 flex size-full p-2 text-highlighted opacity-0 select-none group-hover:opacity-100",
  {
    variants: {
      alignment: {
        center: "items-center justify-center",
        bottom: "items-end justify-between",
      },
      transparent: {
        true: "bg-transparent",
        false: "bg-muted/50",
      },
    },
    defaultVariants: {
      alignment: "center",
      transparent: false,
    },
  },
);

type OverlayVariants = VariantProps<typeof overlay>;
</script>
