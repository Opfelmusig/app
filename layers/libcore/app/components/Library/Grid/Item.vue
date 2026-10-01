<template>
  <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
    <NuxtLink class="w-full" :to="libraryResourceLink(resource)">
      <ArtworkWrapper
        v-slot="{ iconClass, imageSize, artwork }"
        :library-resource="resource"
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
      <NuxtLink :to="libraryResourceLink(resource)" class="flex items-center gap-2">
        <span class="truncate">
          {{ resource.item.name }}
        </span>
        <OMIcon
          v-if="resource.item.personalRating === 1"
          name="lucide:star"
          filled
          class="size-3 shrink-0 text-primary"
        />
        <OMExplicit
          v-if="resource.type === 'library-albums' && resource.item.contentRating === 'explicit'"
          class="ml-auto"
        >
          E
        </OMExplicit>
      </NuxtLink>
      <template v-if="showArtists">
        <span v-if="resource.type === 'library-albums'" class="truncate text-sm text-muted">
          <LibraryLinks
            :links="resource.links"
            type="artists"
            :library-name="resource.item.artistName"
            :library-id="resource.item.artistId"
          />
        </span>
        <span v-else-if="resource.type === 'library-playlists'" class="truncate text-sm text-muted">
          <span v-if="resource.item.curatorName" class="truncate">
            <NuxtLink
              v-if="resource.item.curatorSocialHandle"
              :to="`/profile/${resource.item.curatorSocialHandle}`"
              class="hover:underline"
            >
              {{ resource.item.curatorName }}
            </NuxtLink>
            <span v-else>
              {{ resource.item.curatorName }}
            </span>
          </span>
        </span>
      </template>
      <span
        v-if="showYear && resource.type === 'library-albums' && resource.item.releaseDate"
        class="truncate text-sm text-muted"
      >
        <LibraryReleaseDate :release-date="resource.item.releaseDate" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  ResolvedDbAlbum,
  ResolvedDbArtist,
  ResolvedDbPlaylist,
} from "#layers/libcore/app/database/types";

defineProps<{
  resource: ResolvedDbAlbum | ResolvedDbPlaylist | ResolvedDbArtist;
  showArtists?: boolean;
  showYear?: boolean;
}>();
</script>
