<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <AMArtworkWrapper :resource="artist" context="header" round>
        <AMArtworkImage />
        <AMArtworkPlaceholder />
      </AMArtworkWrapper>
      <div class="flex w-full min-w-0 flex-col justify-end gap-4">
        <div v-if="artist" class="flex min-w-0 flex-col gap-1">
          <h2>
            <img
              v-if="nameArtworkUrl"
              :src="nameArtworkUrl"
              class="h-auto max-h-8 max-w-full object-contain object-left select-none"
              draggable="false"
            />
            <template v-else>{{ artist.attributes.name }}</template>
          </h2>
          <span v-if="artist.attributes.genreNames.length > 0" class="truncate text-sm text-muted">
            {{ artist.attributes.genreNames.join(", ") }}
          </span>
        </div>
        <div v-else-if="isPending" class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
          Loading artist
        </div>
        <div v-else-if="error" class="flex items-center gap-2 text-sm text-error">
          <UIcon name="lucide:x" class="size-4 shrink-0" />
          <span>{{ error.message }}</span>
        </div>
        <p v-else class="text-sm text-muted">Artist not found.</p>
        <div class="flex items-center gap-2">
          <OMButtonPlay
            :disabled="!station || queueStore.requestedStation?.id === station.id"
            @click="station && queueStore.playStation(station)"
          />
          <template v-if="artist">
            <OMButtonSecondary
              fill
              icon="lucide:star"
              :active="artist.attributes.personalRating === 1"
            />
            <template v-if="latestRelease">
              <OMButtonSeparator class="shrink-0" />
              <NuxtLink
                :to="resourceLink(latestRelease)"
                class="flex h-9 min-w-0 items-center gap-2 rounded-xl pr-2.5 text-muted select-none hover:bg-muted"
              >
                <div class="size-9 shrink-0 overflow-hidden p-1">
                  <AMArtworkWrapper class="rounded-lg" :resource="latestRelease" context="grid">
                    <AMArtworkImage />
                    <AMArtworkPlaceholder />
                    <AMArtworkOverlay
                      class="cursor-default p-0"
                      @click.prevent.stop="play(latestRelease)"
                    >
                      <OMIcon
                        :name="latestReleasePending ? 'lucide:loader-circle' : 'lucide:play'"
                        class="size-4"
                        :class="
                          latestReleasePending ? 'animate-spin stroke-3 [&>path]:stroke-3' : ''
                        "
                        :filled="!latestReleasePending"
                      />
                    </AMArtworkOverlay>
                  </AMArtworkWrapper>
                </div>
                <span
                  class="flex min-w-0 items-baseline gap-2 text-sm whitespace-nowrap text-muted"
                >
                  <span class="truncate text-sm font-medium text-default">
                    {{ latestRelease.attributes.name }}
                  </span>
                  <span v-if="latestRelease.attributes.releaseDate" class="shrink-0">
                    (<AMReleaseDate :release-date="latestRelease.attributes.releaseDate" />)
                  </span>
                </span>
                <OMIcon name="lucide:chevron-right" class="size-4 shrink-0" />
              </NuxtLink>
            </template>
          </template>
          <OMButtonTertiary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </div>
    </header>
    <div v-if="artist" class="flex flex-col gap-8 py-4">
      <AMResourceShelf
        v-for="section in views"
        :key="section.view"
        :title="section.title"
        :items="section.items"
        :see-more-to="
          section.hasMore
            ? {
                path: `/resources/artists/${id}/views/${section.view}`,
                query: { name: artist.attributes.name, title: section.title },
              }
            : undefined
        "
        show-artists
        show-year
      />
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { getArtworkUrl } from "@opfelmusig/lib/helpers";

import {
  fetchCatalogArtist,
  fetchCatalogArtistViews,
} from "#layers/amdata/app/lib/queries/artists";

const client = useClient();
const id = useRouteParams<string>("id");

const { data, isPending, error } = useAmQuery({
  key: () => ["artists", id.value, "resource"],
  query: () => fetchCatalogArtist(client, id.value),
  staleTime: ms("1h"),
  gcTime: ms("1d"),
});

const { data: viewsData } = useAmQuery({
  key: () => ["artists", id.value, "views"],
  query: () => fetchCatalogArtistViews(client, id.value),
  staleTime: ms("10m"),
  gcTime: ms("12h"),
});

const artist = computed(() => data.value?.artist);
const station = computed(() => artist.value?.relationships.station);
const queueStore = useQueueStore();

const views = computed(
  () => viewsData.value?.filter((section) => section.view !== "latest-release") ?? [],
);
const latestReleaseView = computed(() =>
  viewsData.value?.find((section) => section.view === "latest-release"),
);
const latestRelease = computed(() => {
  const resource = latestReleaseView.value?.items[0]?.resource;
  return resource?.type === "albums" ? resource : undefined;
});

const { play, pendingResource } = useResourcePlayback();
const latestReleasePending = computed(
  () => pendingResource.value === `albums:${latestRelease.value?.id}`,
);

const nameArtworkUrl = computed(() =>
  getArtworkUrl(artist.value?.attributes.editorialArtwork?.musicContentColorLogoTrimmed, {
    width: 640,
    format: "png",
  }),
);
</script>
