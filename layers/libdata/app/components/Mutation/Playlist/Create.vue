<template>
  <UModal
    v-model:open="open"
    title="Create playlist"
    :description="parent?.attributes.name ? `In ${parent?.attributes.name}` : ''"
    :dismissible="!creatingPlaylist"
    :close="!creatingPlaylist"
  >
    <template #body>
      <form id="create-playlist" class="flex flex-col gap-4" @submit.prevent="createPlaylist">
        <UFormField label="Name" required>
          <UInput
            v-model="playlistName"
            autofocus
            required
            :disabled="creatingPlaylist"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description" hint="Optional">
          <UTextarea
            v-model="playlistDescription"
            :disabled="creatingPlaylist"
            :rows="3"
            class="w-full"
          />
        </UFormField>
        <UCheckbox v-model="playlistPublic" label="Public playlist" :disabled="creatingPlaylist" />
      </form>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="creatingPlaylist" @click="open = false">
        Cancel
      </UButton>
      <UButton
        type="submit"
        form="create-playlist"
        :loading="creatingPlaylist"
        :disabled="!playlistName.trim()"
      >
        Create
      </UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { ROOT_FOLDER_ID } from "@opfelmusig/lib/helpers";

const props = defineProps<{
  parent?: AmLibraryPlaylistFolder;
}>();
const open = defineModel<boolean>("open", { required: true });

const mutations = useMutations();
const playlistName = ref("");
const playlistDescription = ref("");
const playlistPublic = ref(false);

const {
  mutate: submitCreatePlaylist,
  isLoading: creatingPlaylist,
  reset: resetCreatePlaylist,
} = useMutation({
  mutation: (input: { name: string; description?: string; isPublic: boolean; parentId: string }) =>
    mutations.createPlaylist(
      { name: input.name, description: input.description, isPublic: input.isPublic },
      input.parentId,
    ),
  onSuccess: () => {
    open.value = false;
  },
});

function createPlaylist() {
  if (!playlistName.value.trim() || creatingPlaylist.value) return;
  submitCreatePlaylist({
    name: playlistName.value.trim(),
    description: playlistDescription.value.trim() || undefined,
    isPublic: playlistPublic.value,
    parentId: props.parent?.id ?? ROOT_FOLDER_ID,
  });
}

watch(open, (value) => {
  if (!value) return;
  playlistName.value = "";
  playlistDescription.value = "";
  playlistPublic.value = false;
  resetCreatePlaylist();
});
</script>
