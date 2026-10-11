<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource.resource)">
      <AMArtworkWrapper :resource context="grid" color="muted">
        <AMArtworkImage />
        <AMArtworkPlaceholder />
        <AMArtworkOverlay alignment="bottom">
          <AMArtworkOverlayButton
            v-if="playableResource"
            :icon="isPending ? 'lucide:loader-circle' : 'lucide:play'"
            :filled="!isPending"
            :disabled="isPending"
            @click="play(playableResource)"
          />
          <AMArtworkOverlayButton icon="lucide:ellipsis" label="More options" class="ml-auto" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource.resource)" class="flex items-center gap-2">
        <span class="truncate">
          {{ resource.resource.attributes.name }}
        </span>
        <OMStar
          v-if="
            resource.resourceType !== 'social-profiles' &&
            resource.resource.attributes.personalRating === 1
          "
        />
        <OMExplicit
          v-if="
            resource.resourceType === 'library-albums' &&
            resource.resource.attributes.contentRating === 'explicit'
          "
          class="ml-auto"
        >
          E
        </OMExplicit>
      </NuxtLink>
      <template v-if="showArtists">
        <span
          v-if="resource.resourceType === 'library-albums' || resource.resourceType === 'albums'"
          class="truncate text-sm text-muted"
        >
          <AMLinks
            :links="resource.resource.attributes.artists"
            type="artists"
            :fallback-name="resource.resource.attributes.artistName"
            :fallback-id="
              resource.resourceType === 'library-albums'
                ? resource.resource.extras.artistId
                : undefined
            "
          />
        </span>
        <span
          v-else-if="
            resource.resourceType === 'library-playlists' || resource.resourceType === 'playlists'
          "
          class="truncate text-sm text-muted"
        >
          <span v-if="resource.resource.attributes.curatorName" class="truncate">
            <NuxtLink
              v-if="resource.resource.attributes.curatorSocialHandle"
              :to="`/profile/${resource.resource.attributes.curatorSocialHandle}`"
              class="hover:underline"
            >
              {{ resource.resource.attributes.curatorName }}
            </NuxtLink>
            <span v-else>
              {{ resource.resource.attributes.curatorName }}
            </span>
          </span>
        </span>
      </template>
      <span
        v-if="
          showYear &&
          (resource.resourceType === 'library-albums' || resource.resourceType === 'albums') &&
          resource.resource.attributes.releaseDate
        "
        class="truncate text-sm text-muted"
      >
        <NuxtTime
          v-if="resource.resource.attributes.releaseDate"
          :datetime="resource.resource.attributes.releaseDate"
          year="numeric"
        />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AmAlbum } from "#layers/amdata/app/types/albums";
import type { AmArtist } from "#layers/amdata/app/types/artists";
import type { AmPlaylist } from "#layers/amdata/app/types/playlists";
import type { AmSocialProfile } from "#layers/amdata/app/types/profiles";
import type { AmListResource } from "#layers/amdata/app/types/resources";

const props = defineProps<{
  resource: AmListResource<AmAlbum | AmPlaylist | AmArtist | AmSocialProfile>; // station
  showArtists?: boolean;
  showYear?: boolean;
}>();

const playableResource = computed(() => {
  const resource = props.resource.resource;
  if (resource.type === "library-albums" || resource.type === "library-playlists") return resource;

  return null;
});

const { play, pendingResource } = useResourceTracksPlayback();
const isPending = computed(
  () => pendingResource.value === `${props.resource.resourceType}:${props.resource.resource.id}`,
);
</script>
