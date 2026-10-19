<template>
  <table class="w-full shrink-0 table-fixed border-separate border-spacing-0 text-sm select-none">
    <thead>
      <tr class="h-8 text-left text-muted">
        <slot name="header" />
        <OMTableHeader v-if="reorderable" class="w-12" />
      </tr>
    </thead>

    <tbody @dragover="reorder.overTable" @dragleave="reorder.leave" @drop="reorder.drop">
      <slot />
    </tbody>
  </table>
</template>

<script setup lang="ts">
const props = defineProps<{
  reorderable?: boolean;
  reorderIds?: readonly string[];
}>();
const emit = defineEmits<{ reorder: [move: TableReorder] }>();

const reorder = createTableReorder(
  computed(() => !!props.reorderable),
  computed(() => props.reorderIds ?? []),
  (move) => emit("reorder", move),
);
provide(tableReorderKey, reorder);
watch(() => props.reorderable, reorder.reset);
</script>
