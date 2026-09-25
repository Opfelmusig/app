<template>
  <template v-if="!isCollapsed">
    <span
      class="mt-2 flex w-full min-w-0 items-center justify-between gap-2 px-2 py-2 text-xs text-dimmed"
      :class="collapsible ? 'hover:text-muted' : ''"
      @click="collapsed = !collapsed"
    >
      <span class="max-w-full truncate overflow-hidden">
        {{ label }}
      </span>
      <UIcon
        v-if="collapsible"
        name="lucide:chevron-right"
        :class="!collapsed ? 'rotate-90' : ''"
        class="size-3 shrink-0 transition-transform"
      />
    </span>
    <div class="flex w-full flex-col gap-1">
      <Collapse v-if="collapsible" :when="!collapsed" class="transition-[height]">
        <div class="flex w-full flex-col gap-1">
          <slot />
        </div>
      </Collapse>
      <slot v-else />
    </div>
  </template>
  <template v-else>
    <div class="py-1">
      <SidebarBorder />
    </div>
    <slot />
  </template>
</template>

<script lang="ts" setup>
import { Collapse } from "vue-collapsed";

const { isCollapsed } = useSidebar();

defineProps<{
  label: string;
  collapsible?: boolean;
}>();

const collapsed = defineModel<boolean>({
  default: () => false,
});
</script>
