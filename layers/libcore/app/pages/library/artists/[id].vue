<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4">
      <div class="flex min-w-0 items-center gap-2">
        <ArtworkWrapper
          v-slot="{ iconClass, imageSize, artwork }"
          :library-resource="artist"
          size="sm"
          color="muted"
        >
          <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
          <UIcon v-else :name="resourceIcon('artists')" :class="iconClass" />
        </ArtworkWrapper>
        <h2 class="truncate">
          {{ artist?.item.name }}
        </h2>
        <OMIcon
          v-if="artist?.item.personalRating === 1"
          name="lucide:star"
          filled
          class="size-4 shrink-0 text-primary"
        />
      </div>
      <div class="flex items-center gap-2">
        <OMButtonPlay />
        <OMButtonSecondary icon="lucide:shuffle" />
        <OMButtonSeparator />
        <OMButtonSecondary icon="lucide:arrow-up-down" />
        <OMButtonSecondary fill icon="lucide:filter" />
        <UInput
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          class="shrink-0"
          :ui="{ base: 'h-9 rounded-xl' }"
        />
        <OMButtonTeritary icon="lucide:ellipsis" class="ml-auto" />
      </div>
    </header>
    <LibraryGridWrapper :count="albums?.length">
      <LibraryGridItem v-for="album in albums" :key="album.item.id" :resource="album" show-year />
    </LibraryGridWrapper>
    <LibraryFooter>
      <span>{{ albums?.length ?? 0 }} {{ albums?.length === 1 ? "album" : "albums" }}</span>

      <LibraryFooterLink :resource="artist" />
    </LibraryFooter>
  </PageWrapper>
</template>

<script lang="ts" setup>
const id = useRouteParams<string>("id");

const { data: artist } = useLibraryArtist(id);
const { data: albums } = useLibraryArtistAlbums(id);
</script>
