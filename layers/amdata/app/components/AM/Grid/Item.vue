<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource)">
      <AMArtworkWrapper
        v-slot="{ iconClass, imageSize, artwork }"
        :resource="resource.type === 'library-playlist-folders' ? undefined : resource"
        size="lg"
        class="aspect-square h-auto w-full"
        :class="resource.type !== 'library-artists' ? 'rounded-2xl' : ''"
        color="muted"
      >
        <template v-if="resource.type === 'library-playlist-folders' && displayChildren?.length">
          <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-3">
            <AMArtworkWrapper
              v-for="child in displayChildren"
              :key="child.key"
              v-slot="{
                iconClass: childIconClass,
                imageSize: childImageSize,
                artwork: childArtwork,
              }"
              :resource="child.resource"
              class="aspect-square h-auto w-full rounded-lg border"
              :class="child.resource.attributes.artwork ? 'border-transparent' : 'border-muted'"
              color="muted"
            >
              <AMArtworkImage v-if="childArtwork" :width="childImageSize" :artwork="childArtwork" />
              <UIcon v-else :name="resourceIcon(child.resource.type)" :class="childIconClass" />
            </AMArtworkWrapper>
          </div>
        </template>
        <template v-else>
          <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
          <UIcon v-else :name="resourceIcon(resource.type)" :class="iconClass" />
        </template>
        <AMArtworkOverlay v-if="resource.type !== 'library-playlist-folders'" alignment="bottom">
          <AMArtworkOverlayButton icon="lucide:play" filled />
          <AMArtworkOverlayButton icon="lucide:ellipsis" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource)" class="flex items-center gap-2">
        <span class="truncate">
          {{ resource.attributes.name }}
        </span>
        <OMIcon
          v-if="
            resource.type !== 'social-profiles' &&
            resource.type !== 'library-playlist-folders' &&
            resource.attributes.personalRating === 1
          "
          name="lucide:star"
          filled
          class="size-3 shrink-0 text-primary"
        />
        <OMExplicit
          v-if="
            resource.type === 'library-albums' && resource.attributes.contentRating === 'explicit'
          "
          class="ml-auto"
        >
          E
        </OMExplicit>
      </NuxtLink>
      <template v-if="showArtists">
        <span
          v-if="resource.type === 'library-albums' || resource.type === 'albums'"
          class="truncate text-sm text-muted"
        >
          <AMLinks
            :links="resource.attributes.artists"
            type="artists"
            :fallback-name="resource.attributes.artistName"
            :fallback-id="resource.type === 'library-albums' ? resource.extras.artistId : undefined"
          />
        </span>
        <span
          v-else-if="resource.type === 'library-playlists' || resource.type === 'playlists'"
          class="truncate text-sm text-muted"
        >
          <span v-if="resource.attributes.curatorName" class="truncate">
            <NuxtLink
              v-if="resource.attributes.curatorSocialHandle"
              :to="`/profile/${resource.attributes.curatorSocialHandle}`"
              class="hover:underline"
            >
              {{ resource.attributes.curatorName }}
            </NuxtLink>
            <span v-else>
              {{ resource.attributes.curatorName }}
            </span>
          </span>
        </span>
      </template>
      <span
        v-if="
          showYear &&
          (resource.type === 'library-albums' || resource.type === 'albums') &&
          resource.attributes.releaseDate
        "
        class="truncate text-sm text-muted"
      >
        <NuxtTime
          v-if="resource.attributes.releaseDate"
          :datetime="resource.attributes.releaseDate"
          year="numeric"
        />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylistFolder } from "#layers/amdata/app/types/folders";
import type { AmLibraryPlaylist, AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmListResource } from "#layers/amdata/app/types/resources";

const props = defineProps<{
  resource: AmAlbum | AmPlaylist | AmArtist | AmLibraryPlaylistFolder | AmSocialProfile; // station
  showArtists?: boolean;
  showYear?: boolean;
}>();

const library = useLibrary();
const { data: children } = useLibraryQuery({
  key: () => ["folders", props.resource.id, "children"],
  query: () => library.client.getFolderChildren(props.resource.id),
  enabled: props.resource.type === "library-playlist-folders",
});

const displayChildren = computed(() =>
  children.value
    ?.filter(
      (child): child is AmListResource<AmLibraryPlaylist> =>
        child.resource.type === "library-playlists",
    )
    .slice(0, 4),
);
</script>
