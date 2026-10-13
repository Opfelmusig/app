<template>
  <OMTableSimple>
    <span
      draggable="true"
      title="Drag to reorder"
      class="flex size-9 cursor-grab items-center justify-center text-dimmed active:cursor-grabbing"
      @click.stop
      @dblclick.stop
      @dragstart.stop="reorder?.start(id, $event)"
      @dragend.stop="reorder?.reset()"
    >
      <OMIcon name="lucide:menu" class="size-4" />
    </span>
  </OMTableSimple>
</template>

<script setup lang="ts">
import { tableReorderKey } from "#layers/ui/app/utils/tableReorder";

defineProps<{ id: string }>();

const reorder = inject(tableReorderKey, undefined);
</script>
