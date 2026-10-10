<template>
  <OMTableRow no-hover small>
    <td class="border-b border-default px-4 text-start whitespace-nowrap text-dimmed tabular-nums">
      <slot />
    </td>
    <OMTableData :colspan="columns.length + 2" />
  </OMTableRow>
</template>

<script lang="ts" setup>
const columns = useTableColumns();
</script>
