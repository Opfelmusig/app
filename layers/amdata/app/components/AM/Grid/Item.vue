<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource.resource)">
      <AMArtworkWrapper
        v-slot="{ iconClass, imageSize, artwork }"
        :resource
        size="lg"
        class="aspect-square h-auto w-full"
        color="muted"
      >
        <AMArtworkImage v-if="artwork" :width="imageSize" :artwork />
        <UIcon v-else :name="resourceIcon(resource.resource.type)" :class="iconClass" />
        <AMArtworkOverlay alignment="bottom">
          <AMArtworkOverlayButton icon="lucide:play" filled />
          <AMArtworkOverlayButton icon="lucide:ellipsis" />
        </AMArtworkOverlay>
      </AMArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource.resource)" class="flex items-center gap-2">
        <span class="truncate">
          {{ resource.resource.attributes.name }}
        </span>
        <OMIcon
          v-if="
            resource.resource.type !== 'social-profiles' &&
            resource.resource.attributes.personalRating === 1
          "
          name="lucide:star"
          filled
          class="size-3 shrink-0 text-primary"
        />
        <OMExplicit
          v-if="
            resource.resource.type === 'library-albums' &&
            resource.resource.attributes.contentRating === 'explicit'
          "
          class="ml-auto"
        >
          E
        </OMExplicit>
      </NuxtLink>
      <template v-if="showArtists">
        <span
          v-if="resource.resource.type === 'library-albums' || resource.resource.type === 'albums'"
          class="truncate text-sm text-muted"
        >
          <AMLinks
            :links="resource.resource.attributes.artists"
            type="artists"
            :fallback-name="resource.resource.attributes.artistName"
            :fallback-id="
              resource.resource.type === 'library-albums'
                ? resource.resource.extras.artistId
                : undefined
            "
          />
        </span>
        <span
          v-else-if="
            resource.resource.type === 'library-playlists' || resource.resource.type === 'playlists'
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
          (resource.resource.type === 'library-albums' || resource.resource.type === 'albums') &&
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

defineProps<{
  resource: AmListResource<AmAlbum | AmPlaylist | AmArtist | AmSocialProfile>; // station
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
