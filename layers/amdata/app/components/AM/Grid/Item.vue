<template>
  <OMContextMenu :items="menuItems">
    <div class="flex min-w-0 flex-col gap-2 overflow-hidden">
      <NuxtLink
        class="w-full"
        :to="resource.resource.type === 'stations' ? undefined : resourceLink(resource.resource)"
      >
        <AMArtworkWrapper :resource context="grid">
          <AMArtworkImage />
          <AMArtworkPlaceholder />
          <AMArtworkOverlay
            v-if="
              resource.resource.type === 'albums' ||
              resource.resource.type === 'library-albums' ||
              resource.resource.type === 'playlists' ||
              resource.resource.type === 'library-playlists'
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
            v-else-if="
              resource.resource.type === 'artists' || resource.resource.type === 'library-artists'
            "
          >
            <AMArtworkOverlayButton
              v-if="resource.resource.type === 'artists' && resource.resource.relationships.station"
              icon="lucide:play"
              :loading="
                queueStore.requestedStation?.id === resource.resource.relationships.station.id
              "
              filled
              @click="queueStore.playStation(resource.resource.relationships.station)"
            />
            <OMMenuButton v-if="menuItems.length" :items="menuItems">
              <AMArtworkOverlayButton icon="lucide:ellipsis" />
            </OMMenuButton>
          </AMArtworkOverlay>
          <AMArtworkOverlay
            v-else-if="resource.resource.type === 'stations'"
            :class="isStationPending ? 'pointer-events-none' : ''"
            @click="queueStore.playStation(resource.resource)"
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
          v-if="resource.resource.shared?.reasonForDisplay"
          :text="resource.resource.shared.reasonForDisplay"
          arrow
        >
          <span
            class="mb-1 w-full max-w-max min-w-0 truncate rounded-sm bg-muted px-2 py-1 text-sm text-muted select-none"
          >
            {{ resource.resource.shared.reasonForDisplay }}
          </span>
        </UTooltip>
        <NuxtLink :to="resourceLink(resource.resource)" class="flex items-center gap-2">
          <span class="truncate">
            {{ resource.resource.attributes.name }}
          </span>
          <OMStar
            v-if="
              resource.resourceType !== 'social-profiles' &&
              resource.resourceType !== 'stations' &&
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
                :to="
                  rawResourceLink(
                    'social-profiles',
                    resource.resource.attributes.curatorSocialHandle,
                  )
                "
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
  </OMContextMenu>
</template>

<script lang="ts" setup>
const props = defineProps<{
  resource: AmListResource<AmAlbum | AmPlaylist | AmArtist | AmSocialProfile | AmCatalogStation>;
  showArtists?: boolean;
  showYear?: boolean;
}>();

const menuItems = useResourceMenu(() => props.resource);

const playableResource = computed(() => {
  const resource = props.resource.resource;
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
  () =>
    props.resource.resource.type === "stations" &&
    queueStore.requestedStation?.id === props.resource.resource.id,
);

const { play, pendingResource } = useResourcePlayback();
const isPending = computed(() => pendingResource.value === props.resource.resource.id);
</script>
