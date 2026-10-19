<template>
  <LyricsContent :lyrics="data" :pending="isPending" :error :progress="progressMs" @seek="seekMs" />
</template>

<script lang="ts" setup>
import { AppleMusicError } from "@opfelmusig/lib";

const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();

const client = useClient();

const currentSong = computed(() => queueStore.current?.entry);

const { data, error, isPending } = useAmQuery({
  key: () => ["songs", currentSong.value?.id ?? null, "syllable-lyrics"],
  staleTime: ms("1d"),
  gcTime: ms("7d"),
  enabled: () => !!currentSong.value,
  async query() {
    if (!currentSong.value) return;

    try {
      const catalogId =
        currentSong.value.type === "songs"
          ? currentSong.value.id
          : currentSong.value.extras.catalogId;
      if (!catalogId) return;

      const response = await client.catalog.songs.getRelationship(catalogId, "syllable-lyrics", {
        scopes: { "syllable-lyrics": { extend: ["ttmlLocalizations"] } },
      });

      const attributes = response.data[0]?.attributes;
      const ttml = attributes?.ttmlLocalizations || attributes?.ttml;
      return ttml ? parseAppleMusicLyricsTtml(ttml) : undefined;
    } catch (cause) {
      if (cause instanceof AppleMusicError && cause.status === 404) return;
      throw cause;
    }
  },
});

const progressMs = computed(() => playbackStore.position * 1000);
const seekMs = (ms: number | null) => {
  if (ms !== null) playbackStore.seek(ms / 1000);
};
</script>
