<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonTertiary :to="rawResourceLink('playlists', id)" icon="lucide:arrow-left" />
      <h2>{{ title }}</h2>
    </header>
    <USeparator />
    <AMGridWrapper>
      <AMGridStatus :is-pending :error :total="data?.length" :resources="data">
        <AMGrid :items="data" />
      </AMGridStatus>
    </AMGridWrapper>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {
  playlistViews,
  fetchCatalogPlaylistView,
  type PlaylistView,
} from "#layers/amdata/app/lib/queries/playlists";

definePageMeta({
  validate: (route) => playlistViews.some((view) => view === route.params.view),
});

const client = useClient();
const id = useRouteParams<string>("id");
const view = useRouteParams<PlaylistView>("view");

const queryTitle = useRouteQuery<string>("title", "");
const title = computed(() => queryTitle.value || view.value);

const { data, isPending, error } = useAmQuery({
  key: () => ["playlists", id.value, "views", view.value],
  query: () => fetchCatalogPlaylistView(client, id.value, view.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});
</script>
