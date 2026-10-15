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
  fetchCatalogAlbum,
  fetchCatalogAlbumView,
  type AlbumView,
} from "#layers/amdata/app/lib/queries/albums";

definePageMeta({
  validate: (route) => albumViews.some((view) => view === route.params.view),
});

const client = useClient();
const id = useRouteParams<string>("id");
const view = useRouteParams<AlbumView>("view");

const { data: albumData } = useAmQuery({
  key: () => ["albums", id.value],
  query: () => fetchCatalogAlbum(client, id.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const { data, isPending, error } = useAmQuery({
  key: () => ["albums", id.value, "views", view.value],
  query: () => fetchCatalogAlbumView(client, id.value, view.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const title = computed(() => {
  const album = albumData.value;
  const viewTitle =
    album?.views.find((section) => section.view === view.value)?.title ?? view.value;
  return album ? `${album.album.attributes.name} · ${viewTitle}` : viewTitle;
});
</script>
