<template>
  <SidebarItemWrapper
    :to
    :no-route
    :title
    :variant="disabled ? 'disabled' : 'default'"
    :inset
    @click="model = !model"
  >
    <div class="flex size-5 shrink-0 items-center justify-center">
      <UIcon :name="icon" class="size-4 shrink-0" :class="spin ? 'animate-spin' : ''" />
    </div>
    <SidebarItemLabel>
      <slot />
    </SidebarItemLabel>
  </SidebarItemWrapper>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>({ default: false });

defineProps<{
  icon: string;
  to?: string;
  title?: string;
  disabled?: boolean;
  spin?: boolean;
  inset?: number;
  noRoute?: boolean;
}>();
</script>
