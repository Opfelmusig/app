<template>
  <PageWrapper>
    <header class="flex flex-col gap-4 p-4 lg:flex-row">
      <AMArtworkWrapper :resource="song" context="header">
        <AMMediaEditorialVideo
          :editorial-video="song?.resource.attributes.editorialVideo"
          variant="square"
        >
          <template #fallback>
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </template>
        </AMMediaEditorialVideo>
      </AMArtworkWrapper>
      <div class="flex w-full min-w-0 flex-col justify-end gap-4">
        <div v-if="song" class="flex min-w-0 flex-col gap-1">
          <div class="flex items-center gap-2">
            <h2 class="truncate">{{ song.resource.attributes.name }}</h2>
            <OMExplicit v-if="song.resource.attributes.contentRating === 'explicit'" />
            <OMDownloaded v-if="song.resource.extras.libraryId" />
          </div>
          <div class="flex items-center gap-2 text-sm whitespace-nowrap text-muted">
            <AMLinks
              :links="song.resource.attributes.albums"
              type="albums"
              :fallback-name="song.resource.attributes.albumName"
            />
            <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
            <AMLinks
              :links="song.resource.attributes.artists"
              type="artists"
              :fallback-name="song.resource.attributes.artistName"
            />
            <template v-if="song.resource.attributes.releaseDate">
              <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
              <span>
                Released
                <AMReleaseDate
                  :release-date="song.resource.attributes.releaseDate"
                  date-style="long"
                />
              </span>
            </template>
            <template v-if="song.resource.attributes.genreNames.length">
              <div class="size-1 shrink-0 rounded-full bg-accented first:hidden" />
              <span>{{ song.resource.attributes.genreNames.join(", ") }}</span>
            </template>
          </div>
        </div>
        <div v-else-if="isPending" class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
          Loading song
        </div>
        <div v-else-if="error" class="flex items-center gap-2 text-sm text-error">
          <UIcon name="lucide:x" class="size-4 shrink-0" />
          <span>{{ error.message }}</span>
        </div>
        <p v-else class="text-sm text-muted">Song not found.</p>
        <div class="flex items-center gap-2">
          <OMButtonPlay :disabled="!song" @click="play()" />
          <OMButtonSecondary
            v-if="song"
            fill
            icon="lucide:star"
            :active="song.resource.attributes.personalRating === 1"
          />
          <OMMenuButton v-if="menuItems.length" :items="menuItems" class="ml-auto" />
        </div>
      </div>
    </header>
    <USeparator />
    <div class="flex w-full flex-col gap-4 p-4">
      <h2>Lyrics</h2>
      <template v-if="lyrics">
        <div
          v-for="(section, i) in lyrics.sections"
          :key="section.startMs ?? i"
          class="flex w-full flex-col gap-1"
        >
          <div v-for="(line, j) in section.lines" :key="line.key ?? j" class="inline-block">
            <span v-for="(node, k) in line.nodes" :key="node.startMs ?? k">{{ node.text }}</span>
          </div>
        </div>
        <LyricsFooter :songwriters="lyrics.metadata.songwriters" />
      </template>
      <div v-else-if="lyricsPending" class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
        Loading lyrics
      </div>
      <div v-else-if="lyricsError" class="flex items-center gap-2 text-sm text-error">
        <UIcon name="lucide:x" class="size-4 shrink-0" />
        <span>{{ lyricsError.message }}</span>
      </div>
      <p v-else class="text-sm text-muted">No lyrics found.</p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { fetchCatalogSong, fetchCatalogSongLyrics } from "#layers/amdata/app/lib/queries/songs";

const id = useRouteParams<string>("id");

const { data, isPending, error } = useAmQuery({
  key: () => ["songs", id.value, "resource"],
  query: () => fetchCatalogSong(id.value),
  staleTime: ms("1h"),
  gcTime: ms("1d"),
});

const {
  data: lyrics,
  isPending: lyricsPending,
  error: lyricsError,
} = useAmQuery({
  key: () => ["songs", id.value, "lyrics"],
  query: () => fetchCatalogSongLyrics(id.value),
  staleTime: ms("1d"),
  gcTime: ms("7d"),
});

const song = computed(() => (data.value ? createListResource(data.value, id.value, 0) : undefined));

const queueStore = useQueueStore();

function play() {
  if (!song.value) return;

  queueStore.play(song.value);
}

const menuItems = useResourceMenu(() => song.value, {
  actions: { play: () => play() },
});
</script>
