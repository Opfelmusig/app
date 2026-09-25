<template>
  <div
    class="relative flex size-full shrink-0 flex-col overflow-hidden bg-muted/20 whitespace-nowrap select-none"
  >
    <div
      class="absolute size-full p-2 transition-all"
      :class="
        isSettings
          ? 'pointer-events-none origin-left -translate-x-25 scale-x-50 opacity-0 blur-md'
          : ''
      "
    >
      <SidebarDefault />
    </div>
    <div
      class="absolute size-full p-2 transition-all"
      :class="
        isSettings
          ? ''
          : 'pointer-events-none origin-right translate-x-25 scale-x-50 opacity-0 blur-md'
      "
    >
      <SidebarSettings />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const isSettings = computed(
  () => route.path === "/settings" || route.path.startsWith("/settings/"),
);
</script>
