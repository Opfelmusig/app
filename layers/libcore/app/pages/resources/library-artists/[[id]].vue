<template>
  <div class="flex size-full overflow-hidden">
    <div class="relative flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 border-b border-default p-2">
        <OMButtonSecondary icon="lucide:arrow-up-down" />
        <OMButtonSecondary fill icon="lucide:filter" />
        <UInput
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          :ui="{ base: 'h-9 rounded-xl' }"
        />
        <OMButtonTeritary icon="lucide:ellipsis" />
      </header>
      <div class="flex cursor-pointer flex-col text-sm select-none">
        <NuxtLink
          v-for="artist in artists"
          :key="artist.key"
          class="group flex h-14 items-center gap-2 border-b border-default px-2 last:border-b-0 hover:bg-raised route:bg-muted/40 [&:active:not(:has(.no-active:active))]:bg-muted/60"
          :to="rawResourceLink('library-artists', artist.resource.id)"
        >
          <AMArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :resource="artist.resource"
            size="sm"
            color="muted"
          >
            <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon(artist.resource.type)" :class="iconClass" />
          </AMArtworkWrapper>
          <div class="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <span class="truncate">
              {{ artist.resource.attributes.name }}
            </span>
            <OMIcon
              v-if="artist.resource.attributes.personalRating === 1"
              name="lucide:star"
              filled
              class="size-3 shrink-0 text-primary"
            />
          </div>
          <OMButtonTeritary icon="lucide:ellipsis" class="no-active text-muted" @click.prevent />
        </NuxtLink>
      </div>
      <AMFooter>
        <AMFooterCount :count="artists?.length ?? 0" singular="artist" />
      </AMFooter>
    </div>
    <USeparator orientation="vertical" />
    <PageWrapper v-if="id">
      <header class="flex flex-col gap-4 p-4">
        <div class="flex min-w-0 items-center gap-2">
          <AMArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :resource="currentArtist"
            size="sm"
            color="muted"
          >
            <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon('artists')" :class="iconClass" />
          </AMArtworkWrapper>
          <h2 class="truncate">
            {{ currentArtist?.attributes.name ?? "Not Found" }}
          </h2>
          <OMIcon
            v-if="currentArtist?.attributes.personalRating === 1"
            name="lucide:star"
            filled
            class="size-4 shrink-0 text-primary"
          />
        </div>
        <div class="flex items-center gap-2">
          <AMControlsSorting
            v-model="sortBy"
            v-model:direction="direction"
            :items="artistAlbumSorting"
            :active="sortChanged"
            @reset="resetSorting"
          />
          <OMButtonSecondary fill icon="lucide:filter" />
          <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
        </div>
      </header>
      <AMGrid :items="displayedAlbums" show-year />
      <AMFooter>
        <AMFooterCount :count="displayedAlbums?.length ?? 0" singular="album" />

        <AMFooterLink :resource="currentArtist" />
      </AMFooter>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
import { artistAlbumSorting } from "#layers/amdata/app/lib/sorting";
import type { AlbumSort } from "#layers/amdata/app/types/albums";
import { DbListId } from "#layers/libcore/app/database/types";

const { data: artists } = useLibraryList(DbListId.Artists);

const id = useRouteParams<string | undefined>("id");

const library = useLibrary();
const { data: currentArtist } = useLibraryQuery({
  key: () => ["artist", id.value ?? null],
  query: () => library.client.getArtist(id.value!),
  enabled: id,
});
const { data: currentArtistAlbums } = useLibraryQuery({
  key: () => ["artist", id.value ?? null, "albums"],
  query: () => library.client.getArtistAlbums(id.value!),
  enabled: id,
});

const {
  sortBy,
  direction,
  sortChanged,
  reset: resetSorting,
} = useSorting<AlbumSort>(() => `artist:${id.value}:albums`, "title");

const displayedAlbums = computed(() => {
  return sortAlbums(currentArtistAlbums.value ?? [], sortBy.value, direction.value);
});
</script>
