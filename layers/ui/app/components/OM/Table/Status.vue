<template>
  <OMTableRow no-hover>
    <td :colspan="(columns?.length ?? 0) + 3">
      <div
        class="flex size-full items-center justify-center gap-2 px-4 text-sm whitespace-nowrap"
        :class="error ? 'text-error' : 'text-muted'"
      >
        <slot />
      </div>
    </td>
  </OMTableRow>
</template>

<script lang="ts" setup>
import type { SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  columns: SongColumns[];
  error?: boolean;
}>();
</script>
