<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="resourceLink(resource)">
      <ArtworkWrapper
        v-slot="{ iconClass, imageSize, artwork }"
        :resource="resource"
        size="lg"
        class="aspect-square h-auto w-full"
        :class="resource.type !== 'library-artists' ? 'rounded-2xl' : ''"
        color="muted"
      >
        <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
        <UIcon v-else :name="resourceIcon(resource.type)" :class="iconClass" />
      </ArtworkWrapper>
    </NuxtLink>
    <div class="flex w-full min-w-0 flex-col">
      <NuxtLink :to="resourceLink(resource)" class="flex items-center gap-2">
        <span class="truncate">
          {{ resource.attributes.name }}
        </span>
        <OMIcon
          v-if="resource.attributes.personalRating === 1"
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
        <span v-if="resource.type === 'library-albums'" class="truncate text-sm text-muted">
          <AMLinks
            :links="resource.attributes.artists"
            type="artists"
            :fallback-name="resource.attributes.artistName"
            :fallback-id="resource.extras.artistId"
          />
        </span>
        <span v-else-if="resource.type === 'library-playlists'" class="truncate text-sm text-muted">
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
        v-if="showYear && resource.type === 'library-albums' && resource.attributes.releaseDate"
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
import { AMLinks } from "#components";
import type { AmLibraryAlbum } from "#layers/amdata/app/types/albums";
import type { AmLibraryArtist } from "#layers/amdata/app/types/artists";
import type { AmLibraryPlaylist } from "#layers/amdata/app/types/playlists";

defineProps<{
  resource: AmLibraryAlbum | AmLibraryPlaylist | AmLibraryArtist;
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
