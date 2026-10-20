<template>
  <UModal
    v-model:open="open"
    title="Delete playlist"
    :description="`Delete “${playlist.attributes.name}”?`"
    :dismissible="!isLoading"
    :close="!isLoading"
  >
    <template #body>
      <p class="text-sm text-muted">
        This deletes the playlist from your Apple Music library. Songs stay in your library.
      </p>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton color="error" :loading="isLoading" @click="remove">Delete</UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  playlist: AmLibraryPlaylist;
}>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const route = useRoute();

const { mutate, isLoading } = useMutation({
  mutation: async (input: { from: string; returnTo?: string }) => {
    await mutations.deletePlaylist(props.playlist);
    return input;
  },
  onSuccess: async ({ from, returnTo }) => {
    open.value = false;
    if (returnTo && route.path === from) await navigateTo(returnTo);
  },
});

function remove() {
  if (isLoading.value) return;

  const returnTo =
    route.path === resourceLink(props.playlist)
      ? rawResourceLink("library-playlist-folders", props.playlist.extras.parentId)
      : undefined;

  mutate({ from: route.path, returnTo });
}
</script>
