<template>
  <div class="flex flex-col gap-1 p-4">
    <h1>Page not Found</h1>
    <div class="flex gap-1 text-muted">
      <template v-for="(part, index) in $route.params.all" :key="index">
        <span v-if="index">/</span>
        <span>{{ part }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
