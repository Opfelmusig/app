<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource)">
      <AMArtworkWrapper context="grid">
        <template v-if="children?.length">
          <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-3">
            <AMArtworkWrapper
              v-for="child in children"
              :key="child.id"
              :resource="child"
              context="folder-preview"
              class="border"
              :class="child.attributes.artwork ? 'border-transparent' : 'border-muted'"
            >
              <AMArtworkImage />
              <AMArtworkPlaceholder />
            </AMArtworkWrapper>
          </div>
        </template>
        <AMArtworkPlaceholder v-else :name="resourceIcon(resource.type)" />
        <AMArtworkOverlay alignment="bottom">
          <AMArtworkOverlayButton icon="lucide:ellipsis" class="ml-auto" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource)" class="flex items-center gap-2 truncate">
        {{ resource.attributes.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isResourceType } from "@opfelmusig/lib/helpers";

const props = defineProps<{
  resource: AmLibraryPlaylistFolder;
}>();

const { data } = useLibraryFolderChildren(() => props.resource.id);
const children = computed(() =>
  data.value.filter((child) => isResourceType(child, "library-playlists")).slice(0, 4),
);
</script>
