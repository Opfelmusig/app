<template>
  <OMButtonSecondary
    fill
    icon="lucide:star"
    :active="resource.attributes.personalRating === 1"
    :disabled="isLoading"
    @click="toggle()"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  resource: AmSong | AmAlbum | AmArtist | AmPlaylist;
}>();

const mutations = useMutations();
const { mutate: toggle, isLoading } = useMutation({
  mutation: () => {
    const resource = props.resource;
    const counterpartId =
      resource.type === "songs" ||
      resource.type === "albums" ||
      resource.type === "artists" ||
      resource.type === "playlists"
        ? resource.extras.libraryId
        : resource.extras.catalogId;

    return resource.attributes.personalRating === 1
      ? mutations.deleteRating(resource.id, resource.type, counterpartId)
      : mutations.setRating(resource.id, resource.type, 1, counterpartId);
  },
});
</script>
