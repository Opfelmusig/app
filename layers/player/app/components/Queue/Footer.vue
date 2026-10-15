<template>
  <AMFooter v-if="queueStore.currentCount > 0 && queueStore.isLooping && !queueStore.isStation">
    <div class="flex items-center gap-2 text-sm text-muted">
      <UIcon name="lucide:repeat" class="size-3.5" />
      Repeating songs
    </div>
  </AMFooter>
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
</script>
