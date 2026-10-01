<template>
  <div class="flex size-full overflow-hidden">
    <div class="isolate flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 p-2">
        <OMButtonSecondary icon="lucide:arrow-up-down" />
        <OMButtonSecondary fill icon="lucide:filter" />
        <UInput
          variant="soft"
          color="neutral"
          icon="lucide:search"
          placeholder="Search..."
          :ui="{ base: 'h-9 rounded-xl' }"
        />
        <OMButtonTeritary icon="lucide:ellipsis" />
      </header>
      <OMTable>
        <template #header>
          <OMTableHeader class="w-12" />
          <OMTableHeader text="Name" />
          <OMTableHeader class="w-13" />
        </template>
        <template #default>
          <OMTableRow
            v-for="artist in artists"
            :key="artist.entry.id"
            :class="activeArtistId === artist.resource.item.id ? 'bg-muted/40' : ''"
            @click="navigateTo(`/library/artists/${artist.resource.item.id}`)"
          >
            <OMTableImg>
              <ArtworkWrapper
                v-slot="{ iconClass, imageSize, artwork }"
                :library-resource="artist.resource"
                size="sm"
                color="muted"
              >
                <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
                <UIcon v-else :name="resourceIcon(artist.resource.type)" :class="iconClass" />
              </ArtworkWrapper>
            </OMTableImg>
            <OMTableData>
              <div class="flex items-center gap-2">
                <span class="truncate">
                  {{ artist.resource.item.name }}
                </span>
                <OMIcon
                  v-if="artist.resource.item.personalRating === 1"
                  name="lucide:star"
                  filled
                  class="size-3 shrink-0 text-primary"
                />
              </div>
            </OMTableData>
            <OMTableData class="no-active">
              <OMButtonTeritary icon="lucide:ellipsis" class="text-muted" />
            </OMTableData>
          </OMTableRow>
        </template>
      </OMTable>
      <footer
        class="flex shrink-0 justify-between gap-2 border-t border-default p-4 text-sm text-muted"
      >
        <span>
          <span>{{ artists?.length ?? 0 }} {{ artists?.length === 1 ? "artist" : "artists" }}</span>
        </span>
      </footer>
    </div>
    <USeparator orientation="vertical" />
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
import { DbListId } from "#layers/libcore/app/database/types";

const { data: artists } = useLibraryList(DbListId.Artists);

const activeArtistId = useRouteParams<string | undefined>("id");
</script>
