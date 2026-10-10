<template>
  <div class="flex size-full overflow-hidden">
    <div class="relative flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 border-b border-default p-2">
        <OMButtonSecondary
          icon="lucide:arrow-up-down"
          :active="descending"
          @click="descending = !descending"
        />
        <UInput
          v-model="search"
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          class="w-full"
          :ui="{ base: 'h-9 rounded-xl' }"
        />
      </header>
      <div class="flex cursor-pointer flex-col text-sm select-none">
        <NuxtLink
          v-for="genre in sortedGenres"
          :key="genre"
          class="flex gap-2 truncate border-b border-default p-4 last:border-b-0 hover:bg-raised route:bg-muted/40"
          :to="{ name: 'library-genres-name', params: { name: genre } }"
        >
          {{ genre }}
        </NuxtLink>
      </div>
      <AMFooter>
        <AMFooterCount :count="sortedGenres?.length" singular="genre" />
      </AMFooter>
    </div>
    <USeparator orientation="vertical" />
    <PageWrapper v-if="name">
      <header class="flex flex-col gap-4 p-4">
        <div class="flex min-w-0 items-center gap-2">
          <h2 class="truncate">
            {{ name }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="defaultAlbumSorting"
            :active="sortChanged"
            @reset="resetSorting"
          />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </header>
      <AMGrid :items="displayedAlbums" show-artists />
      <AMFooter>
        <AMFooterCount :count="displayedAlbums?.length" singular="album" />
      </AMFooter>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
import { defaultAlbumSorting } from "#layers/amdata/app/lib/sorting";
import type { AlbumSort } from "#layers/amdata/app/types/albums";

const library = useLibrary();
const { data: genres } = useLibraryQuery({
  key: ["genres"],
  query: () => library.client.getGenres(),
});

const name = useRouteParams<string | undefined>("name");
const { data: currentGenreAlbums } = useLibraryQuery({
  key: () => ["genre", name.value ?? null, "albums"],
  query: () => library.client.getGenreAlbums(name.value!),
  enabled: name,
});

const search = ref("");

const searchedGenres = useSearch(genres, search);

const descending = ref(false);

const sortedGenres = computed(() =>
  descending.value ? searchedGenres.value.toReversed() : searchedGenres.value,
);

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<AlbumSort>(() => `genre:${name.value}:albums`, "title");

const displayedAlbums = computed(() => {
  return sortAlbums(currentGenreAlbums.value ?? [], sortBy.value, direction.value);
});
</script>
