<template>
  <OMTableRow no-hover>
    <td class="border-b border-default px-4 text-start whitespace-nowrap text-dimmed tabular-nums">
      <span> Disc {{ disc }} </span>
    </td>
    <OMTableData :colspan="(columns?.length ?? 0) + 2" />
  </OMTableRow>
</template>

<script lang="ts" setup>
import type { SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  disc: number;
  columns?: SongColumns[];
}>();
</script>
