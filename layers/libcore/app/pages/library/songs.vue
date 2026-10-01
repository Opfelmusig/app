<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
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
    </header>
    <LibrarySongs :songs />
    <footer
      class="mt-auto flex shrink-0 justify-between gap-2 border-t border-default p-4 text-sm text-muted"
    >
      <span>
        <span>{{ songs?.length ?? 0 }} {{ songs?.length === 1 ? "song" : "songs" }}, </span>
        <span>
          {{
            ms(libraryTracksDuration(songs?.map((song) => song.resource.item)), {
              long: true,
            })
          }}
        </span>
      </span>
    </footer>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs } = useLibraryList(DbListId.Songs);
</script>
