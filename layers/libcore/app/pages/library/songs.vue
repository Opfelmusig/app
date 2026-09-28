<template>
  <PageWrapper>
    <div class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <OMButtonSecondary icon="lucide:arrow-up-down" />
      <OMButtonSecondary fill icon="lucide:filter" />
      <OMButtonSecondary fill icon="lucide:columns-3" />
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
    <LibrarySongs :songs />
    <div class="flex justify-between gap-2 p-4 text-sm text-muted">
      <span>
        <span>{{ songs?.length ?? 0 }} songs, </span>
        <span>
          {{
            ms(libraryTracksDuration(songs?.map((song) => song.resource.item)), {
              long: true,
            })
          }}
        </span>
      </span>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: songs } = useLibrarySongs();
</script>
