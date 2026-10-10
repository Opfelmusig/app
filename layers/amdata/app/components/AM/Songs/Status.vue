<template>
  <OMTableStatus v-if="isPending" :columns>
    <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
    <span>Loading</span>
  </OMTableStatus>
  <OMTableStatus v-else-if="error" error :columns>
    <UIcon name="lucide:x" class="size-4" />
    <span>{{ error.message }}</span>
  </OMTableStatus>
  <OMTableStatus v-else-if="total === 0" :columns> This list is empty </OMTableStatus>
  <OMTableStatus v-else-if="songs === undefined || songs?.length === 0" :columns>
    No songs found
  </OMTableStatus>
  <slot v-else />
</template>

<script lang="ts" setup>
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong, SongColumns } from "#layers/amdata/app/types/songs";

defineProps<{
  columns: SongColumns[];
  isPending: boolean;
  error: Error | null;
  total?: number;
  songs?: AmListResource<AmSong>[];
}>();
</script>
