<template>
  <OMTable :reorderable :reorder-ids @reorder="$emit('reorder', $event)">
    <template #header>
      <OMTableHeader class="w-12" />
      <OMTableHeader text="Title" />
      <OMTableHeader v-if="columns?.includes('album')" text="Album" />
      <OMTableHeader v-if="columns?.includes('artist')" text="Artist" />
      <OMTableHeader v-if="columns?.includes('genre')" text="Genre" class="w-[15%]" />
      <OMTableHeader v-if="columns?.includes('year')" text="Year" class="w-14" />
      <OMTableHeader v-if="columns?.includes('length')" text="Length" class="w-20 text-end" />
      <OMTableHeader class="w-12" />
    </template>
    <template #default>
      <slot />
    </template>
  </OMTable>
</template>

<script lang="ts" setup>
import { tableColumnsKey } from "#layers/amdata/app/lib/contexts/columns";
import type { SongColumns } from "#layers/amdata/app/types/songs";
import type { TableReorder } from "#layers/ui/app/utils/tableReorder";

const props = defineProps<{
  columns: SongColumns[];
  reorderable?: boolean;
  reorderIds?: readonly string[];
}>();

defineEmits<{ reorder: [move: TableReorder] }>();

provide(
  tableColumnsKey,
  computed(() => props.columns),
);
</script>
