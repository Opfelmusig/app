<template>
  <template v-if="!albumMode || discs.length <= 1 || !albumSort">
    <AMSongsItem
      v-for="(song, i) in songs"
      :key="song.key"
      :song
      :album-mode
      @play="$emit('play', i)"
    />
  </template>
  <template v-for="disc in discs" v-else :key="disc.number">
    <OMTableSeparator>Disc {{ disc.number }}</OMTableSeparator>
    <AMSongsItem
      v-for="(song, i) in disc.songs"
      :key="song.key"
      :song
      :album-mode
      @play="$emit('play', i)"
    />
  </template>
</template>

<script lang="ts" setup>
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

const props = defineProps<{
  songs?: AmListResource<AmSong>[];
  albumMode?: boolean;
  albumSort?: boolean;
}>();

const discs = computed(() => {
  const groups: { number: number; songs: AmListResource<AmSong>[] }[] = [];

  for (const song of props.songs ?? []) {
    const disc = song.resource.attributes.discNumber ?? 1;
    let group = groups.find((group) => group.number === disc);

    if (!group) {
      group = { number: disc, songs: [] };
      groups.push(group);
    }

    group.songs.push(song);
  }

  return groups;
});

defineEmits<{
  (e: "play", index: number): void;
}>();
</script>
