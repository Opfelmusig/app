<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonPlay :disabled="!displayedEntries.length" @click="play()" />
      <OMButtonSecondary
        icon="lucide:shuffle"
        :disabled="!displayedEntries.length"
        @click="play(0, true)"
      />
      <OMButtonSeparator />
      <AMControlsFilters :active="changed" @reset="resetFilters">
        <AMControlsFiltersItem v-model="selectedRatings" label="Rating" :items="ratingFilter" />
        <AMControlsFiltersItem
          v-model="selectedContentRatings"
          label="Content rating"
          :items="contentRatingFilter"
        />
        <AMControlsFiltersSection label="Type">
          <UCheckbox v-model="isUploaded" label="Uploaded" />
        </AMControlsFiltersSection>
      </AMControlsFilters>
      <AMControlsColumns
        v-model="columns"
        :items="songColumns"
        :active="columnsChanged"
        @reset="resetColumns"
      />
      <UInput
        v-model="search"
        variant="soft"
        color="neutral"
        icon="lucide:search"
        placeholder="Search..."
        class="shrink-0"
        :ui="{ base: 'h-9 rounded-xl' }"
      />
      <OMButtonTertiary icon="lucide:ellipsis" class="ml-auto" aria-label="History options" />
    </header>
    <p v-if="!historyStore.entries.length" class="p-4 text-sm text-muted">
      No listening history yet.
    </p>
    <p v-else-if="!displayedEntries.length" class="p-4 text-sm text-muted">
      No songs match your search or filters.
    </p>
    <section v-for="(section, index) in sections" :key="section.id">
      <USeparator v-if="index" />
      <OMTableTitle :title="section.title" :clearable="index === 0" @clear="historyStore.clear" />
      <AMSongsWrapper :columns>
        <AMSongsItem
          v-for="entry in section.entries"
          :key="entry.id"
          :song="entry.track"
          @play="playEntry(entry.id)"
        />
      </AMSongsWrapper>
    </section>
    <AMFooter v-if="displayedEntries.length">
      <AMFooterCount :count="displayedEntries.length" singular="song" />
    </AMFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { entries, groupBy, map, pipe } from "remeda";

import { defaultSongColumns, songColumns } from "#layers/amdata/app/lib/controls/columns";
import { contentRatingFilter, ratingFilter } from "#layers/amdata/app/lib/controls/filters";
import { songSearchKeys } from "#layers/amdata/app/lib/controls/search";

useHead({ title: "History" });

const historyStore = useHistoryStore();
const queueStore = useQueueStore();
const {
  columns,
  columnsChanged,
  reset: resetColumns,
} = useColumns<SongColumns>("history", defaultSongColumns);
const {
  filters,
  selectedRatings,
  selectedContentRatings,
  isUploaded,
  changed,
  reset: resetFilters,
} = useFilters();

const search = ref("");
const tracks = computed(() => historyStore.entries.map((entry) => entry.track));
const searchedSongs = useSearch(tracks, search, songSearchKeys);
const displayedEntries = computed(() => {
  const matches = new Set(
    filterResources<AmSong>(searchedSongs.value, filters.value).map((song) => song.key),
  );
  return historyStore.entries.filter((entry) => matches.has(entry.track.key));
});

const now = useNow({ interval: 60_000 });
const sections = computed(() => {
  const today = new Date(now.value);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return pipe(
    displayedEntries.value,
    groupBy((entry) => {
      const day = new Date(entry.playedAt);
      day.setHours(0, 0, 0, 0);
      return day.toISOString();
    }),
    entries(),
    map(([id, entries]) => {
      const day = new Date(id);
      const title =
        day.getTime() === today.getTime()
          ? "Today"
          : day.getTime() === yesterday.getTime()
            ? "Yesterday"
            : day.toLocaleDateString();
      return { id, title, entries };
    }),
  );
});

function play(index = 0, shuffle = false) {
  if (index < 0 || !displayedEntries.value.length) return;
  queueStore.playContext(
    {
      index,
      tracks: displayedEntries.value.map((entry) => entry.track),
      context: {
        type: "generic",
        name: "History",
        link: "/history",
      },
    },
    shuffle,
  );
}

function playEntry(id: string) {
  play(displayedEntries.value.findIndex((entry) => entry.id === id));
}
</script>
