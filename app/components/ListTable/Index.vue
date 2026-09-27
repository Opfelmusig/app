<template>
  <table class="w-full shrink-0 table-fixed text-sm select-none">
    <thead>
      <tr class="sticky top-0 z-10 h-8 border-b border-default bg-dimmed text-left text-muted">
        <slot name="header" />
      </tr>
    </thead>

    <tbody>
      <slot />
    </tbody>
  </table>
</template>
