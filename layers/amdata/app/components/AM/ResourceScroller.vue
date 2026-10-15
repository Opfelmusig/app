<template>
  <section v-if="items.length" class="flex min-w-0 flex-col gap-3">
    <div class="flex items-end justify-between gap-4 px-4">
      <div class="flex min-w-0 flex-col gap-1">
        <NuxtLink v-if="seeMoreTo" :to="seeMoreTo" class="flex min-w-0 items-center gap-1">
          <h2 class="truncate">{{ title }}</h2>
          <UIcon name="lucide:chevron-right" class="size-5 shrink-0 text-muted" />
        </NuxtLink>
        <h2 v-else class="truncate">{{ title }}</h2>
        <p v-if="description" class="text-sm text-muted">{{ description }}</p>
      </div>
      <div
        v-if="gridItems.length && (!arrivedState.left || !arrivedState.right)"
        class="flex shrink-0 gap-1"
      >
        <UButton
          icon="lucide:chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          class="disabled:text-dimmed"
          :disabled="arrivedState.left"
          @click="scroll(-1)"
        />
        <UButton
          icon="lucide:chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="arrivedState.right"
          class="disabled:text-dimmed"
          @click="scroll(1)"
        />
      </div>
    </div>
    <AMSongsWrapper v-if="songs.length" :columns="['album', 'artist', 'length']">
      <AMSongs :songs="songs.slice(0, 6)" @play="play" />
    </AMSongsWrapper>
    <div
      v-if="gridItems.length"
      ref="scroller"
      class="scrollbar-hide flex snap-x snap-proximity scroll-pl-4 gap-4 overflow-x-auto px-4"
    >
      <div
        v-for="item in gridItems"
        :key="item.key"
        class="flex w-44 shrink-0 snap-start flex-col gap-1 sm:w-52 lg:w-56"
      >
        <AMGridItem :resource="item" :show-artists :show-year />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

type ScrollerResource = Exclude<AmResource, AmLibraryPlaylistFolder>;
type GridResource = Exclude<ScrollerResource, AmSong>;

const props = defineProps<{
  title: string;
  description?: string;
  items: AmListResource<ScrollerResource>[];
  seeMoreTo?: RouteLocationRaw;
  showArtists?: boolean;
  showYear?: boolean;
}>();

const songs = computed(() =>
  props.items.filter(
    (item): item is AmListResource<AmSong> =>
      item.resourceType === "songs" || item.resourceType === "library-songs",
  ),
);
const gridItems = computed(() =>
  props.items.filter(
    (item): item is AmListResource<GridResource> =>
      item.resourceType !== "songs" && item.resourceType !== "library-songs",
  ),
);

const queueStore = useQueueStore();

function play(index: number) {
  queueStore.playContext({
    tracks: songs.value,
    index,
    context: { type: "generic", name: props.title },
  });
}

const scroller = useTemplateRef("scroller");
const { x, arrivedState } = useScroll(scroller, {
  behavior: "smooth",
});

function scroll(direction: number) {
  if (scroller.value) x.value += scroller.value.clientWidth * direction;
}
</script>
