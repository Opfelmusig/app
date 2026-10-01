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
        <div
          v-for="genre in displayedGenres"
          :key="genre"
          class="flex gap-2 truncate border-b border-default p-4 last:border-b-0 hover:bg-raised"
          :class="activeGenreName === genre ? 'bg-muted/40' : ''"
          @click="navigateTo({ name: 'library-genres-name', params: { name: genre } })"
        >
          {{ genre }}
        </div>
      </div>
      <LibraryFooter>
        <span>{{ genres?.length ?? 0 }} {{ genres?.length === 1 ? "genre" : "genres" }}</span>
      </LibraryFooter>
    </div>
    <USeparator orientation="vertical" />
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
import { useFuse } from "@vueuse/integrations/useFuse.js";

const { data: genres } = useLibraryGenres();

const activeGenreName = useRouteParams<string | undefined>("name");

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
