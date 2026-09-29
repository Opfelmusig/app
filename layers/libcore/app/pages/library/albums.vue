<template>
  <PageWrapper>
    <div class="flex items-center gap-2 p-4">
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
    <div ref="container" class="w-full min-w-0 border-y border-default p-4">
      <div class="grid w-full gap-4" :style="gridStyle">
        <div
          v-for="album in albums"
          :key="album.entry.id"
          class="flex min-w-0 flex-col gap-2 overflow-hidden"
        >
          <NuxtLink class="w-full" :to="libraryResourceLink(album.resource)">
            <ArtworkWrapper
              v-slot="{ iconClass, imageSize, artwork }"
              :library-resource="album.resource"
              size="lg"
              class="aspect-square h-auto w-full rounded-xl"
              color="muted"
            >
              <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
              <UIcon v-else :name="resourceIcon(album.resource.type)" :class="iconClass" />
            </ArtworkWrapper>
          </NuxtLink>
          <div class="flex w-full min-w-0 flex-col">
            <NuxtLink :to="libraryResourceLink(album.resource)" class="flex items-center gap-2">
              <span class="truncate">
                {{ album.resource.item.name }}
              </span>
              <OMIcon
                v-if="album.resource.item.personalRating === 1"
                name="lucide:star"
                filled
                class="size-3 shrink-0 text-primary"
              />
              <OMExplicit v-if="album.resource.item.contentRating === 'explicit'" class="ml-auto">
                E
              </OMExplicit>
            </NuxtLink>
            <span class="truncate text-sm text-muted">
              <LibraryLinks
                :links="album.resource.links"
                type="artists"
                :library-name="album.resource.item.artistName"
                :library-id="album.resource.item.artistId"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-between gap-2 p-4 text-sm text-muted">
      <span>
        <span>{{ albums?.length ?? 0 }} albums</span>
      </span>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: albums } = useLibraryAlbums();

const container = useTemplateRef("container");

const containerWidth = ref(0);

const min = 180;
const max = 260;
const gap = 16;

let observer: ResizeObserver | undefined;

onMounted(() => {
  if (!container.value) return;

  observer = new ResizeObserver(([entry]) => {
    if (entry) containerWidth.value = entry.contentRect.width;
  });
  observer.observe(container.value);
});

onUnmounted(() => observer?.disconnect());

const columns = computed(() =>
  Math.max(
    1,
    Math.min(albums.value?.length ?? 0, Math.floor((containerWidth.value + gap) / (min + gap))),
  ),
);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
  maxWidth: `${columns.value * max + (columns.value - 1) * gap}px`,
}));
</script>
