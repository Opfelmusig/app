<template>
  <div class="flex size-full overflow-hidden">
    <div class="relative flex w-80 shrink-0 flex-col overflow-hidden overflow-y-auto">
      <header class="flex items-center gap-2 border-b border-default p-2">
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
      <div class="flex cursor-pointer flex-col text-sm select-none">
        <div
          v-for="artist in artists"
          :key="artist.entry.id"
          class="group flex h-14 gap-2 border-b border-default p-2 last:border-b-0 hover:bg-raised [&:active:not(:has(.no-active:active))]:bg-muted/60"
          :class="activeArtistId === artist.resource.id ? 'bg-muted/40' : ''"
          @click="navigateTo({ name: 'library-artists-id', params: { id: artist.resource.id } })"
        >
          <ArtworkWrapper
            v-slot="{ iconClass, imageSize, artwork }"
            :library-resource="artist.resource"
            size="sm"
            color="muted"
          >
            <ArtworkImage v-if="artwork" :width="imageSize" :artwork />
            <UIcon v-else :name="resourceIcon(artist.resource.type)" :class="iconClass" />
          </ArtworkWrapper>
          <div class="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <span class="truncate">
              {{ artist.resource.attributes.name }}
            </span>
            <OMIcon
              v-if="artist.resource.attributes.personalRating === 1"
              name="lucide:star"
              filled
              class="size-3 shrink-0 text-primary"
            />
          </div>
          <OMButtonTeritary icon="lucide:ellipsis" class="no-active text-muted" @click.stop />
        </div>
      </div>
      <LibraryFooter>
        <span>{{ artists?.length ?? 0 }} {{ artists?.length === 1 ? "artist" : "artists" }}</span>
      </LibraryFooter>
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
