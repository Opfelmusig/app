<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <AMArtworkWrapper :resource="artist ?? undefined" context="header" color="muted" round>
        <AMArtworkImage :alt="artist?.attributes.name" />
        <AMArtworkPlaceholder />
      </AMArtworkWrapper>
      <div v-if="artist" class="flex w-full min-w-0 flex-col justify-end gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h2>{{ artist.attributes.name }}</h2>
          <span class="truncate text-sm text-muted">
            {{ artist.attributes.genreNames.join(", ") }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <OMButtonPlay />
          <OMButtonSecondary
            fill
            icon="lucide:star"
            :active="artist.attributes.personalRating === 1"
            aria-label="Favorite artist"
          />
        </div>
      </div>
      <div v-else-if="isPending" class="flex items-center gap-2 text-sm text-muted" role="status">
        <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
        Loading artist
      </div>
      <div v-else-if="error" class="flex items-center gap-2 text-sm text-error" role="alert">
        <UIcon name="lucide:x" class="size-4 shrink-0" />
        <span>{{ error.message }}</span>
      </div>
      <p v-else class="text-sm text-muted">Artist not found.</p>
    </header>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { fetchCatalogArtist } from "#layers/amdata/app/lib/queries/artists";

const client = useClient();
const id = useRouteParams<string>("id");

const {
  data: artist,
  isPending,
  error,
} = useAmQuery({
  key: () => ["artists", id.value],
  query: () => fetchCatalogArtist(client, id.value),
  staleTime: ms("5m"),
  gcTime: ms("6h"),
});
</script>
