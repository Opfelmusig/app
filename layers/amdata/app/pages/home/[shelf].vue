<template>
  <PageWrapper class="gap-4 p-4">
    <div class="flex items-center gap-3">
      <UButton to="/" icon="lucide:arrow-left" color="neutral" variant="ghost" />
      <h1>{{ title }}</h1>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const title = useRouteQuery<string>("title", "Recommendations");
</script>
