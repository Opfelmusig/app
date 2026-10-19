<template>
  <template v-if="!albumMode || discs.length <= 1 || !albumSort">
    <AMSongsItem
      v-for="(song, i) in songs"
      :key="`${song.id}:${i}`"
      :song
      :album-mode
      @play="$emit('play', i)"
    />
  </template>
  <template v-for="disc in discs" v-else :key="disc.number">
    <OMTableSeparator>Disc {{ disc.number }}</OMTableSeparator>
    <AMSongsItem
      v-for="song in disc.songs"
      :key="`${song.item.id}:${song.index}`"
      :song="song.item"
      :album-mode
      @play="$emit('play', song.index)"
    />
  </template>
</template>

<script lang="ts" setup>
import { groupBy, map, pipe, values } from "remeda";

const props = defineProps<{
  songs?: AmSong[];
  albumMode?: boolean;
  albumSort?: boolean;
}>();

const discs = computed(() =>
  pipe(
    props.songs ?? [],
    map((item, index) => ({ item, index })),
    groupBy(({ item }) => item.attributes.discNumber ?? 1),
    values(),
    map((songs) => ({ number: songs[0].item.attributes.discNumber ?? 1, songs })),
  ),
);

defineEmits<{
  (e: "play", index: number): void;
}>();
</script>
