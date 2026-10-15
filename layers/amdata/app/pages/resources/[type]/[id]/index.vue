<template>
  <PageWrapper class="gap-2 p-4">
    <h1>This resource was not found</h1>
    <span class="flex items-center gap-2 text-muted">
      A resource of type
      <span class="inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 capitalize">
        <UIcon :name="resourceIcon(type)" class="size-4" />
        {{ type.replace("-", " ") }}
      </span>
      does not exist or is not supported.
    </span>
  </PageWrapper>
</template>

<script lang="ts" setup>
const type = useRouteParams<AmResource["type"]>("type");
</script>
