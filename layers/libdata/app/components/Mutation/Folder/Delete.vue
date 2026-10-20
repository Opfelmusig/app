<template>
  <UModal
    v-model:open="open"
    title="Delete folder"
    :description="`Delete “${folder.attributes.name}”?`"
    :dismissible="!isLoading"
    :close="!isLoading"
  >
    <template #body>
      <p class="text-sm text-muted">
        This deletes the folder and all playlists and folders inside it. Songs stay in your library.
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
  folder: AmLibraryPlaylistFolder;
}>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const route = useRoute();
const { playlists, folders } = useLibraryPlaylistsAndFolders();

const { mutate, isLoading } = useMutation({
  mutation: async (input: { from: string; returnTo?: string }) => {
    await mutations.deletePlaylistFolder(props.folder.id);
    return input;
  },
  onSuccess: async ({ from, returnTo }) => {
    open.value = false;
    if (returnTo && route.path === from) await navigateTo(returnTo);
  },
});

function remove() {
  if (isLoading.value) return;

  let current: AmLibraryPlaylist | AmLibraryPlaylistFolder | undefined = [
    ...(playlists.data.value ?? []),
    ...(folders.data.value ?? []),
  ].find((resource) => resourceLink(resource) === route.path);
  const visited = new Set<string>();
  let returnTo =
    route.path === resourceLink(props.folder)
      ? rawResourceLink("library-playlist-folders", props.folder.extras.parentId)
      : undefined;

  while (!returnTo && current && !visited.has(current.id)) {
    if (current.id === props.folder.id) {
      returnTo = rawResourceLink("library-playlist-folders", props.folder.extras.parentId);
      break;
    }
    visited.add(current.id);
    const parentId: string = current.extras.parentId;
    current = folders.data.value?.find((folder) => folder.id === parentId);
  }

  mutate({ from: route.path, returnTo });
}
</script>
