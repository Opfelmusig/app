<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonTertiary :to="rawResourceLink('albums', id)" icon="lucide:arrow-left" />
      <h2>{{ title }}</h2>
    </header>
    <USeparator />
    <AMGridWrapper>
      <AMGridStatus :is-pending :error :total="data?.length" :resources="data">
        <AMGrid :items="data" show-artists show-year />
      </AMGridStatus>
    </AMGridWrapper>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {
  albumViews,
  fetchCatalogAlbumView,
  type AlbumView,
} from "#layers/amdata/app/lib/queries/albums";

definePageMeta({
  validate: (route) => albumViews.some((view) => view === route.params.view),
});

const id = useRouteParams<string>("id");
const view = useRouteParams<AlbumView>("view");

const queryTitle = useRouteQuery<string>("title", "");
const title = computed(() => queryTitle.value || view.value);

const { data, isPending, error } = useAmQuery({
  key: () => ["albums", "views", id.value, view.value],
  query: () => fetchCatalogAlbumView(id.value, view.value),
  staleTime: ms("30m"),
  gcTime: ms("3h"),
});
</script>
