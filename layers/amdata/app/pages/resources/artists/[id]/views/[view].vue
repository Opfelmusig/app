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
  fetchCatalogArtist,
  fetchCatalogArtistView,
  type ArtistView,
} from "#layers/amdata/app/lib/queries/artists";

definePageMeta({
  validate: (route) => artistViews.some((view) => view === route.params.view),
});

const client = useClient();
const id = useRouteParams<string>("id");
const view = useRouteParams<ArtistView>("view");

const { data: artistData } = useAmQuery({
  key: () => ["artists", id.value, "resource"],
  query: () => fetchCatalogArtist(client, id.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const { data, isPending, error } = useAmQuery({
  key: () => ["artists", id.value, "views", view.value],
  query: () => fetchCatalogArtistView(client, id.value, view.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const title = computed(() => {
  const artist = artistData.value;
  const viewTitle =
    artist?.views.find((section) => section.view === view.value)?.title ?? view.value;
  return artist ? `${artist.artist.attributes.name} · ${viewTitle}` : viewTitle;
});
const songs = computed(() => data.value?.filter((item) => item.resourceType === "songs") ?? []);
const gridItems = computed(() => data.value?.filter((item) => item.resourceType !== "songs") ?? []);

const queueStore = useQueueStore();

function play(index: number) {
  if (songs.value.length === 0) return;

  queueStore.playContext({
    tracks: songs.value,
    index,
    context: {
      type: "generic",
      name: title.value,
      link: `/resources/artists/${id.value}/views/${view.value}`,
    },
  });
}
</script>
