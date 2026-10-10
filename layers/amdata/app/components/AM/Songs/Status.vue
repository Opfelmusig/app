<template>
  <OMTableStatus v-if="isPending">
    <UIcon name="lucide:loader-circle" class="size-4 animate-spin" />
    <span>Loading</span>
  </OMTableStatus>
  <OMTableStatus v-else-if="error" error>
    <UIcon name="lucide:x" class="size-4" />
    <span>{{ error.message }}</span>
  </OMTableStatus>
  <OMTableStatus v-else-if="total === 0 && songs?.length === 0"> This list is empty </OMTableStatus>
  <OMTableStatus v-else-if="songs === undefined || songs?.length === 0">
    No songs found
  </OMTableStatus>
  <slot v-else />
</template>

<script lang="ts" setup>
import type { AmListResource } from "#layers/amdata/app/types/resources";
import type { AmSong } from "#layers/amdata/app/types/songs";

defineProps<{
  isPending: boolean;
  error: Error | null;
  total?: number;
  songs?: AmListResource<AmSong>[];
}>();
</script>
