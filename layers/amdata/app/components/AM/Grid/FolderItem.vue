<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource.resource)">
      <AMArtworkWrapper
        v-slot="{ iconClass }"
        size="lg"
        class="aspect-square h-auto w-full"
        color="muted"
      >
        <template v-if="children?.length">
          <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-3">
            <AMArtworkWrapper
              v-for="child in children"
              :key="child.key"
              v-slot="{
                iconClass: childIconClass,
                imageSize: childImageSize,
                artwork: childArtwork,
              }"
              :resource="child"
              class="aspect-square h-auto w-full rounded-lg border"
              :class="child.resource.attributes.artwork ? 'border-transparent' : 'border-muted'"
              color="muted"
            >
              <AMArtworkImage v-if="childArtwork" :width="childImageSize" :artwork="childArtwork" />
              <UIcon v-else :name="resourceIcon(child.resource.type)" :class="childIconClass" />
            </AMArtworkWrapper>
          </div>
        </template>
        <UIcon v-else :name="resourceIcon(resource.resource.type)" :class="iconClass" />
        <AMArtworkOverlay alignment="bottom">
          <AMArtworkOverlayButton icon="lucide:ellipsis" class="ml-auto" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource.resource)" class="flex items-center gap-2 truncate">
        {{ resource.resource.attributes.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmListResource } from "#layers/amdata/app/types/resources";

const props = defineProps<{
  resource: AmListResource<AmLibraryPlaylistFolder>;
}>();

const library = useLibrary();
const { data: children } = useLibraryQuery({
  key: () => ["folders", props.resource.resource.id, "children"],
  query: () => library.client.getFolderPreview(props.resource.resource.id),
});
</script>
