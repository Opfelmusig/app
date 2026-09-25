<template>
  <div
    class="flex size-full relative shrink-0 flex-col overflow-hidden bg-muted/20 whitespace-nowrap select-none"
  >
    <div
      class="absolute size-full p-2 transition-all"
      :class="
        isSettings
          ? '-translate-x-20 origin-left opacity-0 blur-md scale-x-60 pointer-events-none'
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
          : 'translate-x-20 origin-right opacity-0 blur-md scale-x-60 pointer-events-none'
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
