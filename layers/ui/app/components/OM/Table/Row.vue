<template>
  <tr
    class="group last:[&>td]:border-b-0"
    :class="[
      small ? 'h-10' : 'h-14',
      noHover ? '' : 'hover:bg-raised [&:active:not(:has(.no-active:active))]:bg-muted/60',
      reorderId && reorder?.source.value === reorderId ? 'opacity-40' : '',
      placement === 'before' ? '[&>td]:shadow-[inset_0_2px_0_var(--color-primary)]' : '',
      placement === 'after' ? '[&>td]:shadow-[inset_0_-2px_0_var(--color-primary)]' : '',
    ]"
    @dragover="reorder?.over(reorderId, $event)"
  >
    <slot />
    <OMTableReorder v-if="reorder?.enabled.value && reorderId" :id="reorderId" />
  </tr>
</template>

<script lang="ts" setup>
const props = defineProps<{
  noHover?: boolean;
  small?: boolean;
  reorderId?: string;
}>();

const reorder = inject(tableReorderKey, undefined);
const placement = computed(() =>
  props.reorderId && reorder?.target.value?.targetId === props.reorderId
    ? reorder.target.value.placement
    : undefined,
);

onBeforeUnmount(() => {
  if (
    props.reorderId &&
    (reorder?.source.value === props.reorderId ||
      reorder?.target.value?.targetId === props.reorderId)
  ) {
    reorder.reset();
  }
});
</script>
