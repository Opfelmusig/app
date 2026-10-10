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
import { tableColumnsKey } from "#layers/amdata/app/lib/columns";

defineProps<{
  error?: boolean;
}>();

const columns = inject(tableColumnsKey);
</script>
