<template>
  <div
    class="relative flex size-full shrink-0 flex-col overflow-hidden bg-muted/20 whitespace-nowrap select-none"
  >
    <div :class="cn(sidebarPage({ active: !isSettings }))">
      <SidebarDefault />
    </div>
    <div :class="cn(sidebarPage({ active: isSettings, direction: 'right' }))">
      <SidebarSettings />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const isSettings = computed(
  () => route.path === "/settings" || route.path.startsWith("/settings/"),
);

const sidebarPage = cva(
  "absolute size-full px-2 transition-all duration-250 ease-[cubic-bezier(0.34,1.4,0.7,1)]",
  {
    variants: {
      active: {
        false: "pointer-events-none scale-x-50 opacity-0 blur-md",
      },
      direction: {
        left: "",
        right: "",
      },
    },
    compoundVariants: [
      {
        active: false,
        direction: "left",
        class: "origin-left -translate-x-25",
      },
      {
        active: false,
        direction: "right",
        class: "origin-right translate-x-25",
      },
    ],
    defaultVariants: {
      active: true,
      direction: "left",
    },
  },
);
</script>
