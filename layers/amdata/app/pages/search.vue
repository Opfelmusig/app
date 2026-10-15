<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4">
      <form class="w-full max-w-150" @submit.prevent="search">
        <UInput
          ref="search-input"
          v-model="draft"
          autofocus
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          aria-label="Search Apple Music"
          class="w-full"
          :ui="{ base: 'h-10 rounded-xl' }"
        />
      </form>
      <div v-if="term" class="flex flex-wrap gap-2">
        <UButton
          v-for="item in searchFilters"
          :key="item"
          color="neutral"
          size="sm"
          :variant="filter === item ? 'soft' : 'ghost'"
          :aria-pressed="filter === item"
          class="capitalize"
          @click="filter = item"
        >
          {{ item }}
        </UButton>
      </div>
    </header>
    <template v-if="term">
      <div
        v-if="isPending"
        class="flex items-center justify-center gap-2 py-8 text-sm text-muted"
        role="status"
      >
        <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
        Loading results
      </div>
      <div v-else-if="error" class="flex items-center gap-2 p-4 text-sm text-error" role="alert">
        <UIcon name="lucide:x" class="size-4 shrink-0" />
        <span>{{ error.message }}</span>
      </div>
      <p v-else-if="isEmpty" class="py-8 text-center text-sm text-muted">
        No results for “{{ term }}”.
      </p>
      <template v-else-if="data">
        <div v-if="filter === 'all'" class="flex flex-col gap-8 py-4">
          <AMResourceScroller
            v-for="section in sections"
            :key="section"
            :title="section.charAt(0).toUpperCase() + section.slice(1)"
            :items="data[section]"
            :see-more-to="{ path: '/search', query: { term, filter: section } }"
            show-artists
          />
        </div>
        <AMSongsWrapper v-else-if="filter === 'songs'" :columns="['album', 'artist', 'length']">
          <AMSongs :songs="data.songs" @play="play" />
        </AMSongsWrapper>
        <AMGridWrapper v-else>
          <AMGrid :items="data[filter]" show-artists />
        </AMGridWrapper>
      </template>
    </template>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {
  fetchCatalogSearch,
  searchFilters,
  type SearchFilter,
} from "#layers/amdata/app/lib/queries/search";

const client = useClient();
const queueStore = useQueueStore();

const term = useRouteQuery<string>("term", "");
const filter = useRouteQuery<SearchFilter>("filter", "all", {
  transform: {
    get: (value) => (searchFilters.includes(value) ? value : "all"),
    set: (value) => value,
  },
});
const sections = ["songs", "albums", "artists", "playlists"] as const;
const draft = ref(term.value);

function search() {
  term.value = draft.value.trim();
  draft.value = term.value;
}

watch(term, (value) => (draft.value = value));

const { data, isPending, error } = useAmQuery({
  key: () => ["search", term.value, filter.value],
  query: () => fetchCatalogSearch(client, term.value, filter.value),
  enabled: () => !!term.value.trim(),
  staleTime: ms("5m"),
  gcTime: ms("30m"),
});

const isEmpty = computed(() => sections.every((section) => !data.value?.[section].length));

function play(index: number) {
  if (!data.value?.songs.length) return;

  queueStore.playContext({
    tracks: data.value.songs,
    index,
    context: {
      type: "generic",
      name: `Search: ${term.value}`,
      link: `/search?${new URLSearchParams({ term: term.value, filter: "songs" })}`,
    },
  });
}

const searchInput = useTemplateRef("search-input");

useKeybind({
  keys: "ctrl-cmd+f",
  run: () => searchInput.value?.inputRef?.focus(),
  config: { prevent: true, ignoreRepeat: true },
});

useHead({
  title: () => (term.value ? `Search: ${term.value}` : "Search"),
});
</script>
