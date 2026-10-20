<template>
  <PageWrapper>
    <header class="flex items-center gap-2 p-4">
      <OMButtonTertiary :to="rawResourceLink('artists', id)" icon="lucide:arrow-left" />
      <h2>{{ title }}</h2>
    </header>
    <USeparator />
    <AMSongsWrapper v-if="view === 'top-songs'" :columns="['album', 'artist', 'length']">
      <AMSongsStatus :is-pending :error :total="songs.length" :songs>
        <AMSongs :songs @play="play" />
      </AMSongsStatus>
    </AMSongsWrapper>
    <AMGridWrapper v-else>
      <AMGridStatus :is-pending :error :total="gridItems.length" :resources="gridItems">
        <AMGrid :items="gridItems" show-artists show-year />
      </AMGridStatus>
    </AMGridWrapper>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {
  artistViews,
  fetchCatalogArtistView,
  type ArtistView,
} from "#layers/amdata/app/lib/queries/artists";

definePageMeta({
  validate: (route) => artistViews.some((view) => view === route.params.view),
});

const id = useRouteParams<string>("id");
const view = useRouteParams<ArtistView>("view");

const resourceName = useRouteQuery<string>("name", "");
const queryTitle = useRouteQuery<string>("title", "");
const title = computed(() => queryTitle.value || view.value);
const contextName = computed(() => [resourceName.value, title.value].filter(Boolean).join(" · "));

const { data, isPending, error } = useAmQuery({
  key: () => ["artists", "views", id.value, view.value],
  query: () => fetchCatalogArtistView(id.value, view.value),
  staleTime: ms("30m"),
  gcTime: ms("3h"),
});

const songs = computed(() => data.value?.filter((item) => item.type === "songs") ?? []);
const gridItems = computed(() => data.value?.filter((item) => item.type !== "songs") ?? []);

const queueStore = useQueueStore();
const route = useRoute();

function play(index: number) {
  if (songs.value.length === 0) return;

  queueStore.playContext({
    tracks: songs.value,
    index,
    context: {
      type: "generic",
      name: contextName.value,
      link: route.fullPath,
    },
  });
}
</script>
