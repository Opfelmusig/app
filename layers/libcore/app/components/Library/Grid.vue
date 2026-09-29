<template>
  <div ref="container" class="w-full min-w-0 border-y border-default p-4">
    <div class="grid w-full gap-4" :style="gridStyle">
      <div
        v-for="item in items"
        :key="item.entry.id"
        class="flex min-w-0 flex-col gap-2 overflow-hidden"
      >
        <NuxtLink class="w-full" :to="libraryResourceLink(item.resource)">
          <ArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :library-resource="item.resource"
            size="lg"
            class="aspect-square h-auto w-full"
            :class="item.resource.type !== 'library-artists' ? 'rounded-2xl' : ''"
            color="muted"
          >
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon(item.resource.type)" :class="iconClass" />
          </ArtworkWrapper>
        </NuxtLink>
        <div class="flex w-full min-w-0 flex-col">
          <NuxtLink :to="libraryResourceLink(item.resource)" class="flex items-center gap-2">
            <span class="truncate">
              {{ item.resource.item.name }}
            </span>
            <OMIcon
              v-if="item.resource.item.personalRating === 1"
              name="lucide:star"
              filled
              class="size-3 shrink-0 text-primary"
            />
            <OMExplicit
              v-if="
                item.resource.type === 'library-albums' &&
                item.resource.item.contentRating === 'explicit'
              "
              class="ml-auto"
            >
              E
            </OMExplicit>
          </NuxtLink>
          <span v-if="item.resource.type === 'library-albums'" class="truncate text-sm text-muted">
            <LibraryLinks
              :links="item.resource.links"
              type="artists"
              :library-name="item.resource.item.artistName"
              :library-id="item.resource.item.artistId"
            />
          </span>
          <span
            v-else-if="item.resource.type === 'library-playlists'"
            class="truncate text-sm text-muted"
          >
            <span v-if="item.resource.item.curatorName" class="truncate">
              <NuxtLink
                v-if="item.resource.item.curatorSocialHandle"
                :to="`/profile/${item.resource.item.curatorSocialHandle}`"
                class="hover:underline"
              >
                {{ item.resource.item.curatorName }}
              </NuxtLink>
              <span v-else>
                {{ item.resource.item.curatorName }}
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  ResolvedDbAlbum,
  ResolvedDbArtist,
  ResolvedDbListResource,
  ResolvedDbPlaylist,
} from "#layers/libcore/app/database/types";

const props = defineProps<{
  items?: ResolvedDbListResource<ResolvedDbAlbum | ResolvedDbPlaylist | ResolvedDbArtist>[];
}>();

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
    Math.min(props.items?.length ?? 0, Math.floor((containerWidth.value + gap) / (min + gap))),
  ),
);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
  maxWidth: `${columns.value * max + (columns.value - 1) * gap}px`,
}));
</script>
