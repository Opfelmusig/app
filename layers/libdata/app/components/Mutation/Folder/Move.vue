<template>
  <UModal
    v-model:open="open"
    title="Move folder"
    :description="`Choose a destination for “${folder.attributes.name}”.`"
    :dismissible="!isLoading"
    :close="!isLoading"
  >
    <template #body>
      <p v-if="foldersPending" role="status" class="text-sm text-muted">Loading folders…</p>
      <p v-else-if="foldersError" role="alert" class="text-sm text-error">
        Could not load folders.
      </p>
      <MutationFolderPicker
        v-else
        v-model="parentId"
        :folders="folders ?? []"
        :exclude-id="folder.id"
        :disabled="isLoading"
      />
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" :disabled="isLoading" @click="open = false">
        Cancel
      </UButton>
      <UButton :loading="isLoading" :disabled="!canMove" @click="move">Move</UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{ folder: AmLibraryPlaylistFolder }>();
const open = defineModel<boolean>("open", { default: false });

const mutations = useMutations();
const { data: folders, isPending: foldersPending, error: foldersError } = useLibraryFolders();
const parentId = ref(props.folder.extras.parentId);

const { mutate, isLoading } = useMutation({
  mutation: (destination: string) => mutations.movePlaylistFolder(props.folder.id, destination),
  onSuccess: () => {
    open.value = false;
  },
});

const canMove = computed(
  () =>
    !!parentId.value &&
    parentId.value !== props.folder.extras.parentId &&
    !foldersPending.value &&
    !foldersError.value &&
    !isLoading.value,
);

function move() {
  if (canMove.value) mutate(parentId.value);
}
</script>
