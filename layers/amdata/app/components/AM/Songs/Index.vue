<template>
  <AMSongsWrapper :columns>
    <AMSongsItem v-for="song in songs" :key="song.key" :song :columns />
  </AMSongsWrapper>
</template>

<script lang="ts" setup>
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  songs?: AmListResource<AmSong>[];
  columns?: SongColumns[];
}>();
</script>
