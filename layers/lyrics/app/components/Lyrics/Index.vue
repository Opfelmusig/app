<template>
  <LyricsContent :lyrics :pending :error :progress="progressMs" @seek="seekMs" />
</template>

<script lang="ts" setup>
const queueStore = useQueueStore();
const playbackStore = usePlaybackStore();
const { lyrics, error, pending } = useLyrics(() => queueStore.current?.entry.resource);

const progressMs = computed(() => playbackStore.position * 1000);
const seekMs = (ms: number | null) => {
  if (ms !== null) playbackStore.seek(ms / 1000);
};
</script>
