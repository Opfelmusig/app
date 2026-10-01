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

          <UCheckboxGroup
            v-model="visibleColumns"
            :ui="{ fieldset: 'gap-2' }"
            :items="columnOptions"
          />
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
            @click="resetColumns"
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
    <LibrarySongs :songs :columns="visibleColumns" />
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
import type { SongColumns } from "#layers/libcore/app/components/Library/Songs.vue";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: songs } = useLibraryList(DbListId.Songs);

const defaultColumns: SongColumns[] = ["album", "artist", "length"];

const visibleColumns = ref<SongColumns[]>([...defaultColumns]);

const columnOptions: { label: string; value: SongColumns }[] = [
  { label: "Album", value: "album" },
  { label: "Artist", value: "artist" },
  { label: "Genre", value: "genre" },
  { label: "Year", value: "year" },
  { label: "Length", value: "length" },
];

function resetColumns() {
  visibleColumns.value = [...defaultColumns];
}
</script>
