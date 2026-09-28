<template>
  <table class="w-full shrink-0 table-fixed border-separate border-spacing-0 text-sm select-none">
    <thead>
      <tr class="h-8 text-left text-muted">
        <slot name="header" />
      </tr>
    </thead>

    <tbody>
      <slot />
    </tbody>
  </table>
</template>
