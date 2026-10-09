<template>
  <OMTableRow no-hover small>
    <td class="border-b border-default px-4 text-start whitespace-nowrap text-dimmed tabular-nums">
      <slot />
    </td>
    <OMTableData :colspan="(columns?.length ?? 0) + 2" />
  </OMTableRow>
</template>

<script lang="ts" setup>
import type { SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  columns: SongColumns[];
}>();
</script>
