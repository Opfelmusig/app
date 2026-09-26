<template>
  <NuxtLink
    :to
    :title
    :class="cn(link({ minimized: isCollapsed, variant, noRightPadding, noRoute }))"
    :style="{
      paddingLeft: `${isCollapsed ? 0 : paddingLeft}rem`,
    }"
  >
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
const { isCollapsed } = useSidebar();

export type SidebarVariantProp = VariantProps<typeof link>["variant"];

const props = defineProps<{
  to?: string;
  title?: string;
  variant?: SidebarVariantProp;
  inset?: number;
  noRightPadding?: boolean;
  noRoute?: boolean;
}>();

const paddingLeft = computed(() => {
  if (!props.inset) return 0.625;

  if (props.inset > 1) return props.inset + 0.25;

  return props.inset + 0.5;
});

const link = cva(
  "group relative flex min-w-0 shrink-0 grow-0 items-center gap-2.5 overflow-hidden rounded-xl outline-none",
  {
    variants: {
      variant: {
        default: "text-muted hover:bg-elevated",
        error: "bg-error/20 text-error",
        disabled: "pointer-events-none text-muted opacity-40",
      },
      minimized: {
        true: "size-10 justify-center",
        false: "h-10 w-full",
      },
      noRightPadding: {
        true: null,
        false: null,
      },
      noRoute: {
        true: null,
        false: null,
      },
    },
    compoundVariants: [
      {
        minimized: false,
        noRightPadding: false,
        class: "pr-2.5",
      },
      {
        variant: "default",
        noRoute: false,
        class: "route:bg-elevated route:text-default",
      },
    ],
    defaultVariants: {
      variant: "default",
      minimized: false,
      noRightPadding: false,
      noRoute: false,
    },
  },
);
</script>
