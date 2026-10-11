<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
provide(scrollingTextGroupKey, createScrollingTextGroup());
</script>
