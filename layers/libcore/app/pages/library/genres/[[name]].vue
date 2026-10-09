<template>
  <div class="flex size-full overflow-hidden">
    <div class="relative flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 border-b border-default p-2">
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
          v-for="genre in displayedGenres"
          :key="genre"
          class="flex gap-2 truncate border-b border-default p-4 last:border-b-0 hover:bg-raised route:bg-muted/40"
          :to="{ name: 'library-genres-name', params: { name: genre } }"
        >
          {{ genre }}
        </NuxtLink>
      </div>
      <AMFooter>
        <AMFooterCount :count="genres?.length ?? 0" singular="genre" />
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
          <OMButtonSecondary icon="lucide:arrow-up-down" />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </header>
      <AMGrid :items="currentGenreAlbums" show-artists />
      <AMFooter>
        <AMFooterCount :count="currentGenreAlbums?.length ?? 0" singular="album" />
      </AMFooter>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
import { useFuse } from "@vueuse/integrations/useFuse.js";

const { data: genres } = useLibraryGenres();

const name = useRouteParams<string | undefined>("name");
const { data: currentGenreAlbums } = useLibraryGenreAlbums(name);

const search = ref("");

const { results: searchedGenres } = useFuse(search, () => genres.value ?? [], {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    threshold: 0.4,
  },
});

const displayedGenres = computed(() => {
  return searchedGenres.value.map((entry) => entry.item);
});
</script>
