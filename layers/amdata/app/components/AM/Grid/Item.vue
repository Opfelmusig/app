<template>
  <OMContextMenu :items="menuItems">
    <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
      <NuxtLink
        class="w-full"
        :to="resource.type === 'stations' ? undefined : resourceLink(resource)"
      >
        <AMArtworkWrapper :resource context="grid">
          <AMArtworkImage />
          <AMArtworkPlaceholder />
          <AMArtworkOverlay
            v-if="
              resource.type === 'albums' ||
              resource.type === 'library-albums' ||
              resource.type === 'playlists' ||
              resource.type === 'library-playlists'
            "
            alignment="bottom"
          >
            <AMArtworkOverlayButton
              v-if="playableResource"
              icon="lucide:play"
              :loading="isPending"
              filled
              @click="play(playableResource)"
            />
            <OMMenuButton v-if="menuItems.length" :items="menuItems" class="ml-auto">
              <AMArtworkOverlayButton icon="lucide:ellipsis" />
            </OMMenuButton>
          </AMArtworkOverlay>
          <AMArtworkOverlay
            v-else-if="resource.type === 'artists' || resource.type === 'library-artists'"
          >
            <AMArtworkOverlayButton
              v-if="resource.type === 'artists' && resource.relationships.station"
              icon="lucide:play"
              :loading="queueStore.requestedStation?.id === resource.relationships.station.id"
              filled
              @click="queueStore.playStation(resource.relationships.station)"
            />
            <OMMenuButton v-if="menuItems.length" :items="menuItems">
              <AMArtworkOverlayButton icon="lucide:ellipsis" />
            </OMMenuButton>
          </AMArtworkOverlay>
          <AMArtworkOverlay
            v-else-if="resource.type === 'stations'"
            :class="isStationPending ? 'pointer-events-none' : ''"
            @click="queueStore.playStation(resource)"
          >
            <OMIcon
              :name="isStationPending ? 'lucide:loader-circle' : 'lucide:play'"
              class="size-10"
              :class="isStationPending ? 'animate-spin stroke-3 [&>path]:stroke-3' : ''"
              :filled="!isStationPending"
            />
          </AMArtworkOverlay>
        </AMArtworkWrapper>
      </NuxtLink>
      <div class="flex w-full min-w-0 flex-col">
        <UTooltip
          v-if="resource.shared?.reasonForDisplay"
          :text="resource.shared.reasonForDisplay"
          arrow
        >
          <span
            class="mb-1 w-full max-w-max min-w-0 truncate rounded-sm bg-muted px-2 py-1 text-sm text-muted select-none"
          >
            {{ resource.shared.reasonForDisplay }}
          </span>
        </UTooltip>
        <NuxtLink :to="resourceLink(resource)" class="flex items-center gap-2">
          <span class="truncate">
            {{ resource.attributes.name }}
          </span>
          <OMStar
            v-if="
              resource.type !== 'social-profiles' &&
              resource.type !== 'stations' &&
              resource.attributes.personalRating === 1
            "
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
              :fallback-id="
                resource.type === 'library-albums' ? resource.extras.artistId : undefined
              "
            />
          </span>
          <span
            v-else-if="resource.type === 'library-playlists' || resource.type === 'playlists'"
            class="truncate text-sm text-muted"
          >
            <span v-if="resource.attributes.curatorName" class="truncate">
              <NuxtLink
                v-if="resource.attributes.curatorSocialHandle"
                :to="rawResourceLink('social-profiles', resource.attributes.curatorSocialHandle)"
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
  </OMContextMenu>
</template>

<script lang="ts" setup>
const props = defineProps<{
  resource: AmAlbum | AmPlaylist | AmArtist | AmSocialProfile | AmCatalogStation;
  showArtists?: boolean;
  showYear?: boolean;
}>();

const menuItems = useResourceMenu(() => props.resource);

const playableResource = computed(() => {
  const resource = props.resource;
  if (
    resource.type === "albums" ||
    resource.type === "playlists" ||
    resource.type === "library-albums" ||
    resource.type === "library-playlists"
  )
    return resource;

  return null;
});

const queueStore = useQueueStore();

const isStationPending = computed(
  () => props.resource.type === "stations" && queueStore.requestedStation?.id === props.resource.id,
);

const { play, pendingResource } = useResourcePlayback();
const isPending = computed(() => pendingResource.value === props.resource.id);
</script>
