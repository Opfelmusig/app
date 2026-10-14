<template>
  <NuxtLink v-if="link" :to="link" class="flex items-center gap-1 hover:underline">
    <span>Open in catalog</span>
    <UIcon name="lucide:arrow-up-right" class="size-3 text-dimmed" />
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  resource?: AmLibraryAlbum | AmLibraryArtist | AmLibraryPlaylist;
}>();

const link = computed(() => resourceRelationLink(props.resource));
</script>
