<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay />
      <OMButtonSecondary icon="lucide:shuffle" />
      <OMButtonSeparator />
      <OMButtonSecondary icon="lucide:arrow-up-down" />
      <OMButtonSecondary fill icon="lucide:filter" />
      <OMMenu icon="lucide:columns-3">
        <div class="flex w-48 flex-col gap-2 p-2.5 pt-2">
          <span class="text-sm text-muted">Columns</span>
          <UCheckboxGroup v-model="columns" :ui="{ fieldset: 'gap-2' }" :items="options" />
        </div>
        <USeparator />
        <div class="flex w-48 flex-col gap-2 p-1">
          <UButton
            label="Reset columns"
            class="gap-2 rounded-b-lg"
            variant="ghost"
            color="error"
            icon="lucide:corner-up-left"
            :ui="{
              leadingIcon: 'size-4',
            }"
            @click="reset"
          />
        </div>
      </OMMenu>
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
    <LibrarySongs :songs :columns />
    <LibraryFooter>
      <span>
        <span>{{ songs?.length ?? 0 }} {{ songs?.length === 1 ? "song" : "songs" }}, </span>
        <span>
          {{ libraryTracksDuration(songs) }}
        </span>
      </span>
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs } = useLibraryList(DbListId.Songs);

const { columns, options, reset } = useLibrarySongsColumns(DbListId.Songs);
</script>
