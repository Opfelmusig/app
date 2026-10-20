<template>
  <UModal
    v-model:open="open"
    title="Create folder"
    :description="parent?.attributes.name ? `In ${parent.attributes.name}` : ''"
    :dismissible="!creatingFolder"
    :close="!creatingFolder"
    :ui="{ content: 'max-w-md rounded-xl', footer: 'justify-end' }"
  >
    <template #body>
      <form id="create-folder" class="flex flex-col gap-4" @submit.prevent="createFolder">
        <UFormField label="Name" required>
          <UInput
            v-model="folderName"
            autofocus
            required
            :disabled="creatingFolder"
            class="w-full"
          />
        </UFormField>
        <p v-if="createFolderError" role="alert" class="text-sm text-error">
          Could not create the folder. Please try again.
        </p>
      </form>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="creatingFolder" @click="open = false">
        Cancel
      </UButton>
      <UButton
        type="submit"
        form="create-folder"
        :loading="creatingFolder"
        :disabled="!folderName.trim()"
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
const folderName = ref("");

const {
  mutate: submitCreateFolder,
  isLoading: creatingFolder,
  error: createFolderError,
  reset: resetCreateFolder,
} = useMutation({
  mutation: (input: { name: string; parentId: string }) =>
    mutations.createPlaylistFolder({ name: input.name }, input.parentId),
  onSuccess: () => {
    open.value = false;
  },
});

function createFolder() {
  if (!folderName.value.trim() || creatingFolder.value) return;
  submitCreateFolder({
    name: folderName.value.trim(),
    parentId: props.parent?.id ?? ROOT_FOLDER_ID,
  });
}

watch(open, (value) => {
  if (!value) return;
  folderName.value = "";
  resetCreateFolder();
});
</script>
