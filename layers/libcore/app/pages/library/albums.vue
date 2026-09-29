<template>
  <PageWrapper>
    <div class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <OMButtonSecondary icon="lucide:arrow-up-down" />
      <OMButtonSecondary fill icon="lucide:filter" />
      <UInput
        variant="soft"
        color="neutral"
        icon="lucide:search"
        placeholder="Search..."
        class="shrink-0"
        :ui="{ base: 'h-9 rounded-xl' }"
      />
      <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
    </div>
    <LibraryAlbums :albums />
    <div class="flex justify-between gap-2 p-4 text-sm text-muted">
      <span>
        <span>{{ albums?.length ?? 0 }} albums</span>
      </span>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: albums } = useLibraryAlbums();
</script>
